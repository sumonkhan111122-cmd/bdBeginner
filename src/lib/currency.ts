import type { SiteSettings } from '@/types/settings';

type CurrencyConfig = Pick<SiteSettings, 'currency_code' | 'currency_symbol'>;

export const DEFAULT_CURRENCY: CurrencyConfig = {
  currency_code: 'BDT',
  currency_symbol: '\u09F3',
};

export function formatCurrency(
  amount: number,
  config: Partial<CurrencyConfig> = DEFAULT_CURRENCY,
): string {
  const symbol = config.currency_symbol?.trim() || DEFAULT_CURRENCY.currency_symbol;
  const code = config.currency_code?.trim().toUpperCase() || DEFAULT_CURRENCY.currency_code;
  const locale = code === 'BDT' ? 'en-BD' : undefined;
  return `${symbol}${Number(amount).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
