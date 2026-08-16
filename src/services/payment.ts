import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import type { ManualPaymentMethod } from '@/types/settings';

export const MANUAL_REJECTION_REASONS = {
  invalid_transaction_id: 'The transaction ID is invalid.',
  transaction_not_found: 'The transaction could not be found.',
  incorrect_amount: 'The paid amount does not match the order total.',
  duplicate_transaction: 'This transaction ID has already been used.',
  payment_not_received: 'The payment was not received.',
  wrong_recipient: 'The payment was sent to the wrong recipient.',
  transaction_already_used: 'The transaction has already been used for another order.',
  information_mismatch: 'The submitted payment information does not match.',
  other: 'The payment could not be verified.',
} as const;

export type ManualRejectionReasonCode = keyof typeof MANUAL_REJECTION_REASONS;

export type ManualPaymentState = {
  status: 'none' | 'pending' | 'succeeded' | 'failed';
  rejectionReason: string | null;
};

type SafeFunctionErrorBody = {
  error?: string;
  code?: string;
  message?: string;
};

export class PaymentFunctionError extends Error {
  constructor(
    message: string,
    public readonly kind: 'http' | 'relay' | 'fetch' | 'response',
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'PaymentFunctionError';
  }
}

function safeErrorBody(value: unknown): SafeFunctionErrorBody | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  return {
    error: typeof record.error === 'string' ? record.error : undefined,
    code: typeof record.code === 'string' ? record.code : undefined,
    message: typeof record.message === 'string' ? record.message : undefined,
  };
}

async function functionFailure(
  functionName: string,
  error: unknown,
): Promise<PaymentFunctionError> {
  let kind: PaymentFunctionError['kind'] = 'response';
  let body: SafeFunctionErrorBody | null = null;

  if (error instanceof FunctionsHttpError) {
    kind = 'http';
    try {
      body = safeErrorBody(await error.context.json());
    } catch {
      body = null;
    }
  } else if (error instanceof FunctionsRelayError) {
    kind = 'relay';
  } else if (error instanceof FunctionsFetchError) {
    kind = 'fetch';
  }

  if (import.meta.env.DEV) {
    console.error(`[Payment Edge Function] ${functionName}`, {
      errorClass: error instanceof Error ? error.constructor.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown function error',
      response: body,
    });
  }

  const code = body?.code ?? body?.error;
  const message = kind === 'fetch'
    ? 'The payment service could not be reached. Please try again.'
    : kind === 'relay'
      ? 'The payment service is temporarily unavailable. Please try again.'
      : body?.message || 'The payment request could not be completed.';

  return new PaymentFunctionError(message, kind, code);
}

export async function initiateBkashPayment(
  orderNumber: string,
  accessToken?: string,
): Promise<string> {
  const { data, error } = await getSupabase().functions.invoke('bkash-payment-initiate', {
    body: { orderNumber, accessToken },
  });
  if (error) throw await functionFailure('bkash-payment-initiate', error);

  const response = safeErrorBody(data);
  if (!data?.success || typeof data.paymentUrl !== 'string') {
    throw new PaymentFunctionError(
      response?.message || 'bKash did not return a payment address.',
      'response',
      response?.code ?? response?.error,
    );
  }

  let paymentUrl: URL;
  try {
    paymentUrl = new URL(data.paymentUrl);
  } catch {
    throw new PaymentFunctionError('bKash returned an invalid payment address.', 'response');
  }
  if (paymentUrl.protocol !== 'https:') {
    throw new PaymentFunctionError('bKash returned an insecure payment address.', 'response');
  }
  return paymentUrl.toString();
}

export async function submitManualPayment(params: {
  orderNumber: string;
  method: ManualPaymentMethod;
  transactionId: string;
  accessToken?: string;
}): Promise<{ success: true; status: 'pending'; message: string }> {
  const { data, error } = await getSupabase().functions.invoke('manual-payment', {
    body: { action: 'submit', ...params },
  });
  if (error) throw await functionFailure('manual-payment', error);
  if (!data?.success || data.status !== 'pending') {
    const response = safeErrorBody(data);
    throw new PaymentFunctionError(
      response?.message || 'The payment submission was not accepted.',
      'response',
      response?.code ?? response?.error,
    );
  }
  return data;
}

export async function reviewManualPayment(params: {
  action: 'approve' | 'reject' | 'request_resubmission';
  transactionId: string;
  reasonCode?: ManualRejectionReasonCode | 'request_resubmission';
  reasonText?: string;
}): Promise<{ success: true; status: 'succeeded' | 'failed'; message: string }> {
  const { data, error } = await getSupabase().functions.invoke('manual-payment', {
    body: params,
  });
  if (error) throw await functionFailure('manual-payment', error);
  if (!data?.success) {
    const response = safeErrorBody(data);
    throw new PaymentFunctionError(
      response?.message || 'The payment review could not be saved.',
      'response',
      response?.code ?? response?.error,
    );
  }
  return data;
}

export async function getManualPaymentState(
  orderNumber: string,
  accessToken?: string,
): Promise<ManualPaymentState> {
  const { data, error } = await getSupabase().functions.invoke('manual-payment', {
    body: { action: 'status', orderNumber, accessToken },
  });
  if (error) throw await functionFailure('manual-payment', error);
  return {
    status: data?.status === 'pending' || data?.status === 'succeeded' || data?.status === 'failed'
      ? data.status
      : 'none',
    rejectionReason: typeof data?.rejectionReason === 'string' ? data.rejectionReason : null,
  };
}
