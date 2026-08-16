import { useState, useEffect } from 'react';
import { Mail, Phone, User, CheckCircle2 } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { AccountLayout } from '@/components/account/AccountLayout';

export function AccountProfilePage() {
  const { profile, updateProfile, session } = useCustomerAuth();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    // Light phone validation (allow +, spaces, numbers)
    if (phone.trim() && !/^[\d\s+()-]+$/.test(phone.trim())) {
      setError('Please enter a valid phone number');
      setSaving(false);
      return;
    }
    
    const result = await updateProfile({
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
    });
    
    setSaving(false);
    
    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.error ?? 'Failed to update profile. Please try again.');
    }
  };

  return (
    <AccountLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Profile Settings</h1>
          <p className="mt-1 text-ink-500">Manage your personal information and contact details.</p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Read-only Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-ink-700">Email Address</label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  disabled
                  value={session?.user.email || ''}
                  className="h-11 w-full rounded-xl border border-ink-200 bg-ink-50 pl-11 pr-4 text-sm text-ink-600 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-ink-500">Your email address is used for sign-in and cannot be changed here.</p>
            </div>
            
            <hr className="border-ink-100" />
            
            {/* Editable Fields */}
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-sm font-semibold text-ink-700">Full Name</label>
              <div className="relative">
                <User size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-4 text-sm text-ink-800 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-semibold text-ink-700">Phone Number (Optional)</label>
              <div className="relative">
                <Phone size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1XXX-XXXXXX"
                  className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-4 text-sm text-ink-800 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
            
            {/* Status Messages */}
            {error && (
              <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700">
                <CheckCircle2 size={18} />
                Profile updated successfully.
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-8 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </AccountLayout>
  );
}
