import { useSiteSettings } from '@/context/SiteSettingsContext';
import { formatCurrency } from '@/lib/currency';

export function useOrderAmountFormatter(currencyCode: string) {
  const { siteSettings } = useSiteSettings();

  return (amount: number) => {
    if (currencyCode.toUpperCase() === siteSettings.currency_code.toUpperCase()) {
      return formatCurrency(amount, siteSettings);
    }
    return `${currencyCode.toUpperCase()} ${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };
}
