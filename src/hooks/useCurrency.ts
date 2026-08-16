import { useCallback } from 'react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { formatCurrency } from '@/lib/currency';

export function useCurrencyFormatter() {
  const { siteSettings } = useSiteSettings();
  const { currency_code, currency_symbol } = siteSettings;
  return useCallback(
    (amount: number) => formatCurrency(amount, { currency_code, currency_symbol }),
    [currency_code, currency_symbol],
  );
}
