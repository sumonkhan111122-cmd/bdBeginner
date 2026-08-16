// Self-contained in order-notification so dashboard and CLI deployments bundle the same source.
export type SiteSettings = {
  site_name: string;
  logo_url: string | null;
  support_email: string | null;
};

export const EMAIL_TEMPLATE_VERSION = 'bd-v2';

const brandColors = {
  navy: '#0F172A',
  blue: '#2563EB',
  violet: '#8B5CF6',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
};

const fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const escapeEmailHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const safeEmailHref = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? escapeEmailHtml(url.toString()) : '#';
  } catch {
    return '#';
  }
};

export const EmailShell = (content: string, preheader?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>bdBeginner</title>
  <style>
    @media only screen and (max-width: 640px) {
      .email-page { padding: 20px 10px !important; }
      .email-body { padding: 24px 18px !important; }
      .email-header { padding: 24px 18px !important; }
      .email-banner { margin: -24px -18px 28px !important; width: calc(100% + 36px) !important; }
      .email-fluid { width: 100% !important; max-width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${brandColors.background}; font-family: ${fontFamily}; color: ${brandColors.text};">
  <!-- templateVersion=${EMAIL_TEMPLATE_VERSION} -->
  ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; color: transparent;">${escapeEmailHtml(preheader)}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${brandColors.background};">
    <tr>
      <td class="email-page" align="center" style="padding: 40px 20px;">
        <table class="email-fluid" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${brandColors.surface}; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);">
          <tr>
            <td class="email-body" style="padding: 36px 40px 40px;">
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const EmailHeader = (site: SiteSettings) => `
  <table class="email-banner" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: -36px -40px 32px; width: calc(100% + 80px); background-color: ${brandColors.navy}; border-bottom: 4px solid ${brandColors.violet};">
    <tr>
      <td class="email-header" align="left" style="padding: 28px 40px;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          ${site.logo_url ? `<td valign="middle" style="padding-right: 12px;"><span style="display: inline-block; padding: 7px; border-radius: 10px; background: #ffffff;"><img src="${safeEmailHref(site.logo_url)}" width="32" height="32" alt="${escapeEmailHtml(site.site_name || 'bdBeginner')}" style="width: 32px; height: 32px; display: block; object-fit: contain; border: 0;" /></span></td>` : ''}
          <td valign="middle"><div style="color: #ffffff; font-size: 23px; line-height: 1.1; font-weight: 800; letter-spacing: -0.03em;">${escapeEmailHtml(site.site_name || 'bdBeginner')}</div><div style="margin-top: 5px; color: #CBD5E1; font-size: 11px; line-height: 1.3; letter-spacing: 0.08em; text-transform: uppercase;">Digital products &amp; web solutions</div></td>
        </tr></table>
      </td>
    </tr>
  </table>
`;

export const EmailFooter = (site: SiteSettings) => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px; border-top: 1px solid ${brandColors.border}; padding-top: 30px;">
    <tr>
      <td align="left" style="color: ${brandColors.textMuted}; font-size: 13px; line-height: 1.5;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: ${brandColors.navy};">
          ${escapeEmailHtml(site.site_name || 'bdBeginner')}<br/>
          <span style="font-weight: 400; color: ${brandColors.textMuted};">Digital Products, Tools & Web Solutions</span>
        </p>
        <p style="margin: 0 0 10px 0;">
          Need help? <a href="mailto:${escapeEmailHtml(site.support_email || 'support@bdbeginner.com')}" style="color: ${brandColors.blue}; text-decoration: none;">${escapeEmailHtml(site.support_email || 'support@bdbeginner.com')}</a>
        </p>
        <p style="margin: 0;">
          <a href="https://bdbeginner.com" style="color: ${brandColors.textMuted}; text-decoration: underline;">Website</a> &nbsp;|&nbsp; 
          <a href="https://bdbeginner.com/account" style="color: ${brandColors.textMuted}; text-decoration: underline;">My Account</a>
        </p>
      </td>
    </tr>
  </table>
`;

export const EmailTitle = (text: string) => `
  <h2 style="margin: 0 0 20px 0; color: ${brandColors.navy}; font-size: 24px; line-height: 1.25; font-weight: 750; letter-spacing: -0.025em;">${escapeEmailHtml(text)}</h2>
`;

export const EmailText = (text: string) => `
  <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: ${brandColors.text};">${text}</p>
`;

export const EmailButton = (text: string, url: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
    <tr>
      <td align="left">
        <a href="${safeEmailHref(url)}" style="background-color: ${brandColors.blue}; color: #ffffff; display: inline-block; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 700; text-decoration: none; border: 1px solid ${brandColors.blue}; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.22);">
          ${escapeEmailHtml(text)}
        </a>
      </td>
    </tr>
  </table>
`;

export const StatusBadge = (status: string, variant: 'success' | 'warning' | 'neutral' | 'error' = 'neutral') => {
  let bg = '#F1F5F9';
  let color = '#475569';
  let border = '#E2E8F0';
  
  if (variant === 'success') { bg = '#F0FDF4'; color = '#166534'; border = '#BBF7D0'; }
  else if (variant === 'warning') { bg = '#FEFCE8'; color = '#854D0E'; border = '#FEF08A'; }
  else if (variant === 'error') { bg = '#FEF2F2'; color = '#991B1B'; border = '#FECACA'; }
  else if (variant === 'neutral') { bg = '#EFF6FF'; color = '#1E40AF'; border = '#BFDBFE'; }

  return `
    <span style="display: inline-block; padding: 4px 12px; background-color: ${bg}; color: ${color}; border: 1px solid ${border}; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
      ${escapeEmailHtml(status)}
    </span>
  `;
};

export const InfoBox = (children: string) => `
  <div style="background-color: ${brandColors.background}; border: 1px solid ${brandColors.border}; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    ${children}
  </div>
`;

export const ProductRows = (items: { product_name: string; quantity: number; unit_price: number; line_total: number }[], currency: string) => {
  const formatPrice = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  
  const rowsHtml = items.map(item => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid ${brandColors.border}; font-size: 14px;">
        <div style="font-weight: 500; color: ${brandColors.navy}; margin-bottom: 4px;">${escapeEmailHtml(item.product_name)}</div>
        <div style="color: ${brandColors.textMuted}; font-size: 13px;">Qty: ${item.quantity}</div>
      </td>
      <td align="right" valign="top" style="padding: 16px 0; border-bottom: 1px solid ${brandColors.border}; font-size: 14px; font-weight: 500; color: ${brandColors.navy};">
        ${formatPrice(item.line_total)}
      </td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      ${rowsHtml}
    </table>
  `;
};

export const PriceSummary = (subtotal: number, discount: number, total: number, currency: string, paymentStatus: string) => {
  const formatPrice = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  const isPaid = paymentStatus === 'paid';

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; width: 100%; max-width: 300px; margin-left: auto;">
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: ${brandColors.textMuted};">Subtotal</td>
        <td align="right" style="padding: 8px 0; font-size: 14px; color: ${brandColors.text};">${formatPrice(subtotal)}</td>
      </tr>
      ${discount > 0 ? `
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: ${brandColors.textMuted};">Discount</td>
        <td align="right" style="padding: 8px 0; font-size: 14px; color: #166534;">-${formatPrice(discount)}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 16px 0 8px 0; font-size: 16px; font-weight: 700; color: ${brandColors.navy}; border-top: 1px solid ${brandColors.border};">Total</td>
        <td align="right" style="padding: 16px 0 8px 0; font-size: 16px; font-weight: 700; color: ${brandColors.navy}; border-top: 1px solid ${brandColors.border};">${formatPrice(total)}</td>
      </tr>
      ${isPaid ? `
      <tr>
        <td style="padding: 8px 0; font-size: 14px; font-weight: 500; color: ${brandColors.textMuted};">Amount Paid</td>
        <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: 500; color: ${brandColors.navy};">${formatPrice(total)}</td>
      </tr>
      ` : ''}
    </table>
  `;
};
