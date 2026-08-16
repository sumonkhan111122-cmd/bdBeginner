import { getSupabase } from '@/lib/supabase';
import type {
  ManualPaymentMethod,
  PaymentMethodSetting,
  PaymentMethodSettingInput,
} from '@/types/settings';

const manualMethods: ManualPaymentMethod[] = [
  'bkash_personal',
  'nagad_personal',
  'rocket_personal',
];

export function isManualPaymentMethod(value: string): value is ManualPaymentMethod {
  return manualMethods.includes(value as ManualPaymentMethod);
}

export function getBkashDescription(setting: PaymentMethodSetting): string {
  return setting.instructions[0] || 'Automatic confirmation';
}

export async function fetchPublicPaymentSettings(): Promise<PaymentMethodSetting[]> {
  const { data, error } = await getSupabase()
    .from('payment_method_settings')
    .select('*')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as PaymentMethodSetting[];
}

export async function fetchAdminPaymentSettings(): Promise<PaymentMethodSetting[]> {
  const { data, error } = await getSupabase()
    .from('payment_method_settings')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as PaymentMethodSetting[];
}

export async function updatePaymentMethodSetting(
  id: string,
  input: PaymentMethodSettingInput,
): Promise<PaymentMethodSetting> {
  const { data, error } = await getSupabase()
    .from('payment_method_settings')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as PaymentMethodSetting;
}

export function getEnabledManualMethods(
  settings: PaymentMethodSetting[],
): PaymentMethodSetting[] {
  return settings.filter(
    (setting) => setting.enabled && isManualPaymentMethod(setting.method),
  );
}
