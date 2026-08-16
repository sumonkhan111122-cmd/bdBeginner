import { useState } from 'react';
import { Mail, RefreshCw, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { OrderEmailLogRow } from '@/services/admin';
import { getSupabase } from '@/lib/supabase';

export function OrderEmailLogs({ logs, loading, orderNumber, onReload, onRetry }: { logs: OrderEmailLogRow[], loading: boolean, orderId: string, orderNumber: string, onReload: () => void, onRetry: (eventType: string) => void }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-invoice?order=${orderNumber}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        let msg = 'Download failed';
        try {
          const errData = await response.json();
          if (errData.error) msg = errData.error;
        } catch (_) {
          // ignore
        }
        throw new Error(msg);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Best guess name, browser will override with content-disposition header if available
      a.download = `bdBeginner-Invoice-${orderNumber}.pdf`; 
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download invoice:', e);
      alert(e instanceof Error ? e.message : 'Failed to download invoice.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
          <Mail size={18} className="text-ink-400" /> Email & Invoice Logs
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={onReload} 
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button 
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50"
          >
            <FileText size={14} /> {downloading ? 'Downloading...' : 'Download Current PDF'}
          </button>
        </div>
      </div>
      
      {loading && logs.length === 0 ? (
        <p className="text-sm text-ink-500">Loading logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-ink-500">No email logs found for this order.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-ink-200 text-xs uppercase tracking-wider text-ink-500">
                <th className="pb-3 pr-4 font-semibold">Event Type</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 pr-4 font-semibold">Attachment</th>
                <th className="pb-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {logs.map(log => (
                <tr key={log.id} className="group">
                  <td className="py-3 pr-4 font-medium text-ink-900">
                    {log.event_type}
                  </td>
                  <td className="py-3 pr-4">
                    {log.status === 'sent' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">
                        <CheckCircle2 size={12} /> Sent
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-error-50 px-2 py-0.5 text-xs font-semibold text-error-700">
                          <XCircle size={12} /> Failed
                        </span>
                        <button onClick={() => onRetry(log.event_type.split(':')[0])} className="text-xs font-semibold text-brand-600 hover:underline">Retry</button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs text-ink-500 max-w-[200px] truncate" title={log.attachment || ''}>
                    {log.attachment || '—'}
                  </td>
                  <td className="py-3 text-xs text-ink-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
