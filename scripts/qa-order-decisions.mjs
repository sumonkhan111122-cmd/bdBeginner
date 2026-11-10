// Exercises the real order decision service with an in-memory Supabase adapter.
// No credentials, network requests, or production order mutations are used.
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundled = await build({
  entryPoints: ['src/services/orders.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
  logLevel: 'silent',
  plugins: [{
    name: 'mock-order-dependencies',
    setup(builder) {
      builder.onResolve({ filter: /^@\/(lib\/supabase|services\/payment)$/ }, ({ path }) => ({ path, namespace: 'order-test' }));
      builder.onLoad({ filter: /.*/, namespace: 'order-test' }, ({ path }) => ({
        contents: path.endsWith('supabase')
          ? 'export function getSupabase() { return globalThis.__orderDecisionMocks.client; }'
          : 'export function reviewManualPayment(input) { return globalThis.__orderDecisionMocks.review(input); }',
        loader: 'js',
      }));
    },
  }],
});
const service = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

const initialOrder = () => ({
  id: 'mock-order', order_number: 'BDB-TEST-ONLY', order_status: 'pending',
  payment_status: 'pending', fulfillment_status: 'unfulfilled',
  admin_note: 'Preserve the existing note.', updated_at: '2026-11-05T00:00:00.000Z',
});
const manualTransaction = id => ({ id, provider: 'bkash_personal', status: 'pending' });

function mocks(options = {}) {
  const state = {
    order: { ...initialOrder(), ...options.order },
    transactions: structuredClone(options.transactions ?? []),
    events: [], reviews: [], writes: [], notifications: [],
  };
  class Query {
    constructor(table) { this.table = table; this.filters = []; this.payload = null; }
    select() { return this; }
    eq(key, value) { this.filters.push([key, value]); return this; }
    update(payload) { this.payload = payload; return this; }
    maybeSingle() { return this.execute(); }
    then(resolve, reject) { return this.execute().then(resolve, reject); }
    async execute() {
      if (this.table === 'payment_transactions') {
        if (options.transactionError) return { data: null, error: new Error('Transaction lookup failed.') };
        state.events.push('read-transactions');
        return { data: structuredClone(state.transactions), error: null };
      }
      assert.equal(this.table, 'orders');
      if (!this.payload) {
        state.events.push('read-order');
        return { data: structuredClone(state.order), error: null };
      }
      state.events.push('write-order');
      state.writes.push({ payload: this.payload, filters: this.filters });
      options.beforeUpdate?.(state);
      if (options.updateError) return { data: null, error: new Error('Order update failed.') };
      if (!this.filters.every(([key, value]) => state.order[key] === value)) return { data: null, error: null };
      Object.assign(state.order, this.payload);
      return { data: structuredClone(state.order), error: null };
    }
  }
  state.client = {
    from: table => new Query(table),
    functions: { invoke: async (name, input) => {
      assert.equal(name, 'order-notification');
      state.notifications.push(input.body.event_type);
      return { data: { success: true }, error: null };
    } },
  };
  state.review = async input => {
    state.reviews.push(input);
    state.events.push(`review-${input.action}`);
    options.reviewStarted?.();
    if (options.reviewGate) await options.reviewGate;
    if (options.reviewError) throw new Error('Protected payment review failed.');
    const transaction = state.transactions.find(item => item.id === input.transactionId);
    assert.ok(transaction, 'the protected review receives a real pending transaction');
    assert.equal(transaction.status, 'pending');
    transaction.status = input.action === 'approve' ? 'succeeded' : 'failed';
    state.order.payment_status = input.action === 'approve' ? 'paid' : 'unpaid';
    state.order.updated_at = '2026-11-05T00:00:01.000Z';
    return { success: true, status: transaction.status, message: 'Reviewed.' };
  };
  globalThis.__orderDecisionMocks = state;
  return state;
}

let passed = 0;
async function check(name, test) {
  await test();
  passed++;
  console.log(`PASS ${name}`);
}

await check('manual disapproval rejects payment first, then persists cancellation', async () => {
  const state = mocks({ transactions: [manualTransaction('manual-1')] });
  const result = await service.disapproveAdminOrder(initialOrder());
  assert.equal(result.order_status, 'cancelled');
  assert.equal(result.payment_status, 'failed');
  assert.equal(result.fulfillment_status, 'cancelled');
  assert.equal(result.admin_note, 'Preserve the existing note.');
  assert.equal(state.transactions[0].status, 'failed');
  assert.ok(state.events.indexOf('review-reject') < state.events.indexOf('write-order'));
  assert.equal(state.reviews[0].reasonCode, 'other');
  assert.equal(state.reviews[0].reasonText, 'This payment submission was disapproved by an administrator.');
  assert.deepEqual(state.notifications.sort(), ['order_status_cancelled_customer', 'payment_status_failed_customer', 'fulfillment_status_cancelled_customer'].sort());
});

await check('unpaid order without payment submissions can be disapproved', async () => {
  const state = mocks({ order: { payment_status: 'unpaid' } });
  const result = await service.disapproveAdminOrder(initialOrder());
  assert.equal(result.order_status, 'cancelled');
  assert.equal(state.reviews.length, 0);
});

await check('protected review error stops cancellation and notifications', async () => {
  const state = mocks({ transactions: [manualTransaction('manual-1')], reviewError: true });
  await assert.rejects(service.disapproveAdminOrder(initialOrder()), /Protected payment review failed/);
  assert.equal(state.writes.length, 0);
  assert.equal(state.notifications.length, 0);
  assert.equal(state.order.order_status, 'pending');
});

for (const [label, order] of [
  ['paid', { payment_status: 'paid' }],
  ['refunded', { payment_status: 'refunded' }],
  ['cancelled', { order_status: 'cancelled' }],
  ['completed', { order_status: 'completed' }],
]) {
  await check(`fresh ${label} order is guarded even when UI data is stale`, async () => {
    const state = mocks({ order });
    await assert.rejects(service.disapproveAdminOrder(initialOrder()), /already been processed/);
    assert.equal(state.writes.length, 0);
    assert.equal(state.reviews.length, 0);
  });
}

await check('successful payment transaction blocks disapproval despite stale order status', async () => {
  const state = mocks({ transactions: [{ id: 'gateway-1', provider: 'bkash', status: 'succeeded' }] });
  await assert.rejects(service.disapproveAdminOrder(initialOrder()), /completed or refunded payment/);
  assert.equal(state.writes.length, 0);
});

await check('compare-and-swap cannot overwrite concurrent payment approval', async () => {
  const state = mocks({ beforeUpdate: current => { current.order.payment_status = 'paid'; } });
  await assert.rejects(service.disapproveAdminOrder(initialOrder()), /changed by another review/);
  assert.equal(state.order.payment_status, 'paid');
  assert.equal(state.order.order_status, 'pending');
  assert.equal(state.notifications.length, 0);
});

await check('approval reviews manual payment before marking the order completed', async () => {
  const state = mocks({ transactions: [manualTransaction('manual-1')] });
  const result = await service.approveAndConfirmAdminOrder(initialOrder());
  assert.equal(result.order_status, 'completed');
  assert.equal(result.payment_status, 'paid');
  assert.equal(result.fulfillment_status, 'fulfilled');
  assert.equal(state.transactions[0].status, 'succeeded');
  assert.ok(state.events.indexOf('review-approve') < state.events.indexOf('write-order'));
  assert.ok(!state.notifications.includes('payment_status_paid_customer'), 'the protected endpoint owns the paid notification');
});

await check('legacy status column is preserved', async () => {
  const state = mocks();
  delete state.order.order_status;
  state.order.status = 'pending';
  const result = await service.disapproveAdminOrder(initialOrder());
  assert.equal(result.status, 'cancelled');
  assert.ok(!Object.hasOwn(result, 'order_status'));
});

await check('transaction lookup failure stops the decision', async () => {
  const state = mocks({ transactionError: true });
  await assert.rejects(service.disapproveAdminOrder(initialOrder()), /Transaction lookup failed/);
  assert.equal(state.writes.length, 0);
});

await check('order update error is reported without success notifications', async () => {
  const state = mocks({ updateError: true });
  await assert.rejects(service.disapproveAdminOrder(initialOrder()), /Order update failed/);
  assert.equal(state.order.order_status, 'pending');
  assert.equal(state.notifications.length, 0);
});

await check('shared synchronous lock blocks simultaneous approve and disapprove', async () => {
  let releaseReview;
  let reviewStarted;
  const gate = new Promise(resolve => { releaseReview = resolve; });
  const started = new Promise(resolve => { reviewStarted = resolve; });
  const state = mocks({ transactions: [manualTransaction('manual-1')], reviewGate: gate, reviewStarted });
  const disapproval = service.disapproveAdminOrder(initialOrder());
  await started;
  await assert.rejects(service.approveAndConfirmAdminOrder(initialOrder()), /already being updated/);
  releaseReview();
  await disapproval;
  assert.equal(state.reviews.length, 1);
  assert.equal(state.writes.length, 1);
});

await check('gateway transactions are never sent to the manual review endpoint', async () => {
  const state = mocks({ transactions: [{ id: 'gateway-1', provider: 'bkash', status: 'pending' }] });
  await service.disapproveAdminOrder(initialOrder());
  assert.equal(state.reviews.length, 0);
  assert.equal(state.transactions[0].status, 'pending');
});

await check('ambiguous multiple manual submissions do not get approved automatically', async () => {
  const state = mocks({ transactions: [manualTransaction('manual-1'), manualTransaction('manual-2')] });
  await assert.rejects(service.approveAndConfirmAdminOrder(initialOrder()), /multiple pending payment submissions/);
  assert.equal(state.reviews.length, 0);
  assert.equal(state.writes.length, 0);
});

delete globalThis.__orderDecisionMocks;
console.log(`${passed} mocked order-decision checks passed. No live API calls were made.`);
