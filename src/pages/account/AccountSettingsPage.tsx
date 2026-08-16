import { Link } from 'react-router-dom';
import { User, Shield, ChevronRight } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';

const settingsLinks = [
  {
    label: 'Profile',
    description: 'Update your name, email, and personal information.',
    to: '/account/profile',
    icon: User,
  },
  {
    label: 'Security',
    description: 'Change your password and manage account security.',
    to: '/account/security',
    icon: Shield,
  },
];

export function AccountSettingsPage() {
  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage your account preferences and security.
          </p>
        </div>

        <div className="space-y-3">
          {settingsLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition-colors hover:border-ink-200 hover:bg-ink-50/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink-900">{item.label}</h3>
                    <p className="mt-0.5 text-sm text-ink-500">{item.description}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-ink-300" />
              </Link>
            );
          })}
        </div>
      </div>
    </AccountLayout>
  );
}
