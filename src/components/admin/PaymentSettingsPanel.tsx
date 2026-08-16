import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Image as ImageIcon, Loader2, Save, ShieldCheck } from 'lucide-react';
import { safeHttpUrl } from '@/lib/urls';
import {
  fetchAdminPaymentSettings,
  getBkashDescription,
  updatePaymentMethodSetting,
} from '@/services/paymentSettings';
import type { PaymentMethodSetting } from '@/types/settings';

type EditableSetting = PaymentMethodSetting & { instructionsText: string };

const inputClass = 'h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <label className="flex items-center justify-between gap-4 rounded-xl border border-ink-100 p-4"><span className="text-sm font-semibold text-ink-800">{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 rounded border-ink-300 text-brand-600 focus:ring-brand-500" /></label>;
}

function PaymentField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block"><span className="text-sm font-semibold text-ink-700">{label}</span><div className="mt-1.5">{children}</div>{hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}</label>;
}

export function PaymentSettingsPanel() {
  const [settings, setSettings] = useState<EditableSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [failedQrIds, setFailedQrIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAdminPaymentSettings();
      setSettings(rows.map((row) => ({
        ...row,
        instructionsText: row.method === 'bkash'
          ? getBkashDescription(row)
          : row.instructions.join('\n'),
      })));
      setDirty(false);
    } catch {
      setError('Payment settings could not be loaded. Please confirm your admin session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const update = <K extends keyof EditableSetting>(id: string, key: K, value: EditableSetting[K]) => {
    setSettings((current) => current.map((setting) => setting.id === id ? { ...setting, [key]: value } : setting));
    setDirty(true);
    setMessage(null);
  };

  const handleSave = async () => {
    setError(null);
    setMessage(null);
    for (const setting of settings) {
      if (!setting.display_name.trim()) {
        setError(`${setting.method}: Display Name is required.`);
        return;
      }
      if (setting.qr_image_url && !safeHttpUrl(setting.qr_image_url)) {
        setError(`${setting.display_name}: QR Image URL must be a valid http(s) URL.`);
        return;
      }
    }

    setSaving(true);
    try {
      await Promise.all(settings.map((setting) => updatePaymentMethodSetting(setting.id, {
        enabled: setting.enabled,
        display_name: setting.display_name.trim(),
        recipient_number: setting.method === 'bkash' ? null : setting.recipient_number?.trim() || null,
        account_type: setting.method === 'bkash' ? null : setting.account_type?.trim() || null,
        qr_image_url: setting.method === 'bkash' ? null : setting.qr_image_url?.trim() || null,
        instructions: setting.method === 'bkash'
          ? [setting.instructionsText.trim() || 'Automatic confirmation']
          : setting.instructionsText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
        sort_order: Number.isFinite(Number(setting.sort_order)) ? Number(setting.sort_order) : 0,
      })));
      await load();
      setMessage('Payment settings saved successfully.');
    } catch {
      setError('Payment settings could not be saved. Please confirm admin access and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={28} /></div>;

  const directBkash = settings.find((setting) => setting.method === 'bkash');
  const manualSettings = settings.filter((setting) => setting.method !== 'bkash');

  return (
    <div className="space-y-6">
      {error && <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle className="mt-0.5 shrink-0" size={16} />{error}</div>}
      {message && <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-4 text-sm text-success-700"><CheckCircle2 size={16} />{message}</div>}

      {directBkash && (
        <section className="rounded-2xl border border-ink-100 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-display text-lg font-bold text-ink-900">Direct bKash</h2><p className="mt-1 text-xs text-ink-500">Automatic hosted checkout and confirmation.</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600"><ShieldCheck size={14} /> Credentials managed in Edge Function secrets</span></div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Toggle checked={directBkash.enabled} onChange={(value) => update(directBkash.id, 'enabled', value)} label="Enabled" />
            <PaymentField label="Display Name"><input value={directBkash.display_name} onChange={(event) => update(directBkash.id, 'display_name', event.target.value)} className={inputClass} /></PaymentField>
            <div className="md:col-span-2"><PaymentField label="Description"><input value={directBkash.instructionsText} onChange={(event) => update(directBkash.id, 'instructionsText', event.target.value)} className={inputClass} placeholder="Automatic confirmation" /></PaymentField></div>
          </div>
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        {manualSettings.map((setting) => {
          const qrUrl = safeHttpUrl(setting.qr_image_url);
          const qrFailed = failedQrIds.has(setting.id);
          return (
            <section key={setting.id} className="rounded-2xl border border-ink-100 p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">{setting.display_name}</h2>
              <p className="mt-1 text-xs font-mono text-ink-400">{setting.method}</p>
              <div className="mt-5 space-y-4">
                <Toggle checked={setting.enabled} onChange={(value) => update(setting.id, 'enabled', value)} label="Enabled" />
                <PaymentField label="Display Name"><input value={setting.display_name} onChange={(event) => update(setting.id, 'display_name', event.target.value)} className={inputClass} /></PaymentField>
                <PaymentField label="Recipient Number"><input value={setting.recipient_number ?? ''} onChange={(event) => update(setting.id, 'recipient_number', event.target.value)} className={inputClass} /></PaymentField>
                <PaymentField label="Account Type"><input value={setting.account_type ?? ''} onChange={(event) => update(setting.id, 'account_type', event.target.value)} className={inputClass} /></PaymentField>
                <PaymentField label="QR Image URL"><input type="url" value={setting.qr_image_url ?? ''} onChange={(event) => { update(setting.id, 'qr_image_url', event.target.value); setFailedQrIds((current) => { const next = new Set(current); next.delete(setting.id); return next; }); }} className={inputClass} placeholder="https://…" /></PaymentField>
                <PaymentField label="Instructions" hint="One instruction per line"><textarea value={setting.instructionsText} onChange={(event) => update(setting.id, 'instructionsText', event.target.value)} rows={6} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></PaymentField>
                <PaymentField label="Sort Order"><input type="number" value={setting.sort_order} onChange={(event) => update(setting.id, 'sort_order', Number(event.target.value))} className={inputClass} /></PaymentField>
                {qrUrl && !qrFailed ? <div className="flex h-52 items-center justify-center rounded-xl bg-white p-3 ring-1 ring-ink-100"><img src={qrUrl} alt={`${setting.display_name} QR preview`} onError={() => setFailedQrIds((current) => new Set(current).add(setting.id))} className="h-full w-full object-contain" /></div> : <div className="flex h-28 flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50 text-center text-xs text-ink-500"><ImageIcon size={22} className="mb-2 text-ink-300" />{setting.qr_image_url ? 'QR image is unavailable.' : 'No QR image configured.'}</div>}
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-ink-100 pt-5"><button type="button" onClick={handleSave} disabled={saving || !dirty} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}{saving ? 'Saving…' : 'Save Payment Settings'}</button></div>
    </div>
  );
}
