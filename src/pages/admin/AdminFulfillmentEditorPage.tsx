import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Key,
  MessageSquare,
  Package,
  Save,
  Shield,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  adminSaveFulfillment,
  adminListFulfillmentEvents,
  adminSyncPending,
} from '@/services/fulfillment';
import { getSupabase } from '@/lib/supabase';
import type { FulfillmentEventRow } from '@/types/orders';

const inputClass =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
const labelClass = 'block text-sm font-semibold text-ink-700';

type FulfillmentDetail = {
  id: string;
  order_id: string;
  order_item_id: string;
  delivery_type: string;
  fulfillment_status: string;
  encrypted_payload: string | null;
  payload_iv: string | null;
  public_message: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

function SubscriptionEditor({
  fulfillment,
  onSaved,
}: {
  fulfillment: FulfillmentDetail;
  onSaved: () => void;
}) {
  const [loginUrl, setLoginUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('');
  const [instructions, setInstructions] = useState('');
  const [expiresAt, setExpiresAt] = useState(fulfillment.expires_at?.slice(0, 10) || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (newStatus?: string) => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await adminSaveFulfillment(
        fulfillment.id,
        'subscription',
        { login_url: loginUrl, username, password, plan, instructions },
        newStatus,
        undefined,
        expiresAt || undefined
      );
      setMessage(newStatus ? `Saved and status set to ${newStatus}.` : 'Delivery saved.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Login URL
          <input value={loginUrl} onChange={(e) => setLoginUrl(e.target.value)} className={`${inputClass} mt-1.5`} placeholder="https://example.com/login" />
        </label>
        <label className={labelClass}>
          Username / Email
          <input value={username} onChange={(e) => setUsername(e.target.value)} className={`${inputClass} mt-1.5`} placeholder="user@example.com" />
        </label>
        <label className={labelClass}>
          Password / Access Code
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={`${inputClass} mt-1.5`} placeholder="Encrypted server-side" />
        </label>
        <label className={labelClass}>
          Plan
          <input value={plan} onChange={(e) => setPlan(e.target.value)} className={`${inputClass} mt-1.5`} placeholder="Premium, Pro, etc." />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Instructions
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} className={`${inputClass} mt-1.5`} placeholder="Setup instructions for the customer…" />
        </label>
        <label className={labelClass}>
          Expiry Date
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={`${inputClass} mt-1.5`} />
        </label>
      </div>

      {message && <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700"><CheckCircle2 size={16} />{message}</div>}
      {error && <div className="flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700"><AlertCircle size={16} />{error}</div>}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => handleSave()} disabled={saving}>
          <Save size={15} /> Save Delivery
        </Button>
        {fulfillment.fulfillment_status === 'pending' && (
          <Button size="sm" onClick={() => handleSave('ready')} disabled={saving}>
            <CheckCircle2 size={15} /> Save & Mark Ready
          </Button>
        )}
      </div>
    </div>
  );
}

function ManualDeliveryEditor({
  fulfillment,
  onSaved,
}: {
  fulfillment: FulfillmentDetail;
  onSaved: () => void;
}) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (newStatus?: string) => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await adminSaveFulfillment(
        fulfillment.id,
        'manual_delivery',
        { content },
        newStatus
      );
      setMessage(newStatus ? `Saved and status set to ${newStatus}.` : 'Delivery saved.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className={labelClass}>
        Delivery Information
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className={`${inputClass} mt-1.5 font-mono`}
          placeholder="Account credentials, activation instructions, serial numbers, etc.&#10;This content is encrypted server-side."
        />
      </label>

      {message && <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700"><CheckCircle2 size={16} />{message}</div>}
      {error && <div className="flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700"><AlertCircle size={16} />{error}</div>}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => handleSave()} disabled={saving}>
          <Save size={15} /> Save Delivery
        </Button>
        {fulfillment.fulfillment_status === 'pending' && (
          <Button size="sm" onClick={() => handleSave('ready')} disabled={saving}>
            <CheckCircle2 size={15} /> Save & Mark Ready
          </Button>
        )}
      </div>
    </div>
  );
}

function ServiceEditor({
  fulfillment,
  onSaved,
}: {
  fulfillment: FulfillmentDetail;
  onSaved: () => void;
}) {
  const [publicMessage, setPublicMessage] = useState(fulfillment.public_message || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (newStatus?: string) => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await adminSaveFulfillment(
        fulfillment.id,
        'service',
        undefined,
        newStatus,
        publicMessage
      );
      setMessage(newStatus ? `Status set to ${newStatus}.` : 'Message saved.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const currentStatus = fulfillment.fulfillment_status;

  return (
    <div className="space-y-4">
      <label className={labelClass}>
        Customer-Safe Message
        <textarea
          value={publicMessage}
          onChange={(e) => setPublicMessage(e.target.value)}
          rows={4}
          className={`${inputClass} mt-1.5`}
          placeholder="e.g. We received your request. Work has started."
        />
      </label>

      {message && <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700"><CheckCircle2 size={16} />{message}</div>}
      {error && <div className="flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700"><AlertCircle size={16} />{error}</div>}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => handleSave()} disabled={saving}>
          <Save size={15} /> Save Message
        </Button>
        {currentStatus === 'pending' && (
          <Button size="sm" variant="secondary" onClick={() => handleSave('processing')} disabled={saving}>
            Start Processing
          </Button>
        )}
        {(currentStatus === 'pending' || currentStatus === 'processing') && (
          <Button size="sm" onClick={() => handleSave('completed')} disabled={saving}>
            <CheckCircle2 size={15} /> Mark Completed
          </Button>
        )}
      </div>
    </div>
  );
}

function LicenseKeyViewer({
  fulfillment,
  onSaved,
}: {
  fulfillment: FulfillmentDetail;
  onSaved: () => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await adminSyncPending({ orderId: fulfillment.order_id });
      setMessage('Sync completed.');
      onSaved();
    } catch {
      setMessage('Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/50 p-4">
        <Key size={20} className="text-brand-600" />
        <div>
          <p className="text-sm font-medium text-ink-800">
            Status: <span className="font-bold capitalize">{fulfillment.fulfillment_status}</span>
          </p>
          <p className="mt-0.5 text-xs text-ink-500">
            License assignment is managed via inventory. Use the product's license inventory page to add keys.
          </p>
        </div>
      </div>

      {message && <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700"><CheckCircle2 size={16} />{message}</div>}

      {fulfillment.fulfillment_status === 'pending' && (
        <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing}>
          <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
          Sync Pending Licenses
        </Button>
      )}
    </div>
  );
}

// -- Refresh icon for sync button
function RefreshCw(props: { size: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
}

function AdminFulfillmentContent() {
  const { orderId = '', fulfillmentId = '' } = useParams();
  const [fulfillment, setFulfillment] = useState<FulfillmentDetail | null>(null);
  const [events, setEvents] = useState<FulfillmentEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sb = getSupabase();
      const { data, error: fetchError } = await sb
        .from('order_item_fulfillments')
        .select('*')
        .eq('id', fulfillmentId)
        .single();
      if (fetchError || !data) throw new Error('Fulfillment not found');
      setFulfillment(data as FulfillmentDetail);

      const evts = await adminListFulfillmentEvents(fulfillmentId);
      setEvents(evts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [fulfillmentId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
      </div>
    );
  }

  if (error || !fulfillment) {
    return (
      <div className="px-5 py-10 lg:px-8">
        <div className="flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700">
          <AlertCircle size={17} />
          {error || 'Fulfillment not found.'}
        </div>
      </div>
    );
  }

  const deliveryLabels: Record<string, string> = {
    license_key: 'License Key',
    subscription: 'Subscription',
    manual_delivery: 'Manual Delivery',
    service: 'Service',
  };

  const iconMap: Record<string, typeof Package> = {
    license_key: Key,
    subscription: Shield,
    manual_delivery: Package,
    service: MessageSquare,
  };

  const Icon = iconMap[fulfillment.delivery_type] || Package;

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <Link
        to={`/admin/orders/${orderId}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={16} /> Back to Order
      </Link>

      <div className="mt-4">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
          <Icon size={24} className="text-brand-600" />
          {deliveryLabels[fulfillment.delivery_type] || fulfillment.delivery_type} Fulfillment
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Status: <span className="font-semibold capitalize">{fulfillment.fulfillment_status}</span>
          {fulfillment.expires_at && (
            <> · Expires: {new Date(fulfillment.expires_at).toLocaleDateString()}</>
          )}
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Delivery Configuration</h2>
            <div className="mt-4">
              {fulfillment.delivery_type === 'license_key' && (
                <LicenseKeyViewer fulfillment={fulfillment} onSaved={load} />
              )}
              {fulfillment.delivery_type === 'subscription' && (
                <SubscriptionEditor fulfillment={fulfillment} onSaved={load} />
              )}
              {fulfillment.delivery_type === 'manual_delivery' && (
                <ManualDeliveryEditor fulfillment={fulfillment} onSaved={load} />
              )}
              {fulfillment.delivery_type === 'service' && (
                <ServiceEditor fulfillment={fulfillment} onSaved={load} />
              )}
            </div>
          </section>
        </div>

        <div>
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
              <Clock3 size={16} className="text-ink-400" />
              History
            </h2>
            {events.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">No events yet.</p>
            ) : (
              <ol className="mt-4 space-y-3 border-l border-ink-200 pl-4">
                {events.map((evt) => (
                  <li key={evt.id} className="relative">
                    <span className="absolute -left-[18px] top-1.5 h-2 w-2 rounded-full bg-brand-500" />
                    <p className="text-xs text-ink-400">
                      {new Date(evt.created_at).toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-ink-800">
                      {evt.event_type.replace(/_/g, ' ')}
                    </p>
                    {evt.details && (
                      <p className="mt-0.5 text-xs text-ink-500">{evt.details}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export function AdminFulfillmentEditorPage() {
  return <AdminFulfillmentContent />;
}
