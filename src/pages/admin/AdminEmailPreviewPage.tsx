import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { Mail, Monitor, Smartphone, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const TEMPLATES = [
  { id: 'order_received', label: 'Order Received' },
  { id: 'payment_pending', label: 'Payment Pending' },
  { id: 'payment_approved', label: 'Payment Approved' },
  { id: 'payment_rejected', label: 'Payment Rejected' },
  { id: 'product_ready', label: 'Product Ready' },
  { id: 'refund_confirmation', label: 'Refund Confirmation' },
  { id: 'account_activation', label: 'Account Activation' },
];

export function AdminEmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const fetchTemplate = async (templateId: string) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error: fnError } = await supabase.functions.invoke('email-preview', {
        body: { template: templateId }
      });

      if (fnError) throw fnError;
      if (data && data.html) {
        setHtmlContent(data.html);
      } else {
        throw new Error('No HTML content returned');
      }
    } catch (err: unknown) {
      console.error('Error fetching email template:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preview');
      setHtmlContent('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate(selectedTemplate);
  }, [selectedTemplate]);

  return (
    <>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              Templates
            </h3>
            <div className="flex flex-col gap-1">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTemplate === t.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">View Mode</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">
              {TEMPLATES.find(t => t.id === selectedTemplate)?.label}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTemplate(selectedTemplate)}
              disabled={loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center bg-slate-100/50">
            {error ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex flex-col items-center max-w-md text-center mt-12">
                <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
                <h3 className="font-bold text-lg mb-2">Preview Failed</h3>
                <p className="text-sm opacity-90">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => fetchTemplate(selectedTemplate)}>Try Again</Button>
              </div>
            ) : htmlContent ? (
              <div 
                className={`bg-white shadow-lg transition-all duration-300 mx-auto ${
                  viewMode === 'mobile' ? 'w-[375px] min-h-[667px] rounded-3xl border-8 border-slate-900 overflow-hidden' : 'w-full max-w-3xl min-h-full border border-slate-200 rounded-xl'
                }`}
              >
                <iframe
                  title="Email Preview"
                  srcDoc={htmlContent}
                  className="w-full h-full min-h-[600px] border-0 rounded-xl bg-white"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-20">
                <Mail className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a template to preview</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
