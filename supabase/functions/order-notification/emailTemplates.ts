import { SiteSettings, EmailShell, EmailHeader, EmailFooter, EmailTitle, EmailText, EmailButton, StatusBadge, InfoBox, ProductRows, PriceSummary, escapeEmailHtml } from './emailComponents.ts';

export type OrderData = {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total: number;
  subtotal?: number;
  discount_total?: number;
  currency_code: string;
  order_status: string;
  payment_status: string;
  created_at: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  invoice_number?: string | null;
  items: { product_name: string; quantity: number; unit_price: number; line_total: number }[];
};

export type ActivationData = {
  email: string;
  action_link: string;
};

export type ReviewEmailData = {
  id: string;
  user_id: string;
  author_name: string;
  rating: number;
  content: string;
  admin_reply?: string | null;
  product?: { name?: string | null; slug?: string | null } | null;
  user?: { email?: string | null } | null;
};

const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

const esc = escapeEmailHtml;
const orderUrl = (siteUrl: string, orderNumber: string, admin = false) =>
  `${siteUrl}${admin ? '/admin/orders/' : '/account/orders/'}${encodeURIComponent(orderNumber)}`;

export const getOrderCreatedCustomerHtml = (order: OrderData, site: SiteSettings, siteUrl?: string) => {
  const isPending = order.payment_status !== 'paid';
  const subtotal = order.subtotal ?? order.total + (order.discount_total || 0);

  const content = `
    ${EmailHeader(site)}
    ${EmailTitle('Order Received!')}
    ${EmailText(`Hi ${esc(order.customer_name)},`)}
    ${EmailText('Thank you for your order. We’ve received it and are processing it now.')}
    
    ${InfoBox(`
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #0F172A;">Order Summary</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; margin-bottom: 8px;">
          <tr>
            <td style="color: #64748B; padding-bottom: 8px; width: 120px;">Order Number:</td>
            <td style="color: #0F172A; font-weight: 500; padding-bottom: 8px;">${esc(order.order_number)}</td>
          </tr>
          <tr>
            <td style="color: #64748B; padding-bottom: 8px;">Date:</td>
            <td style="color: #0F172A; padding-bottom: 8px;">${new Date(order.created_at).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="color: #64748B; padding-bottom: 8px;">Payment:</td>
            <td style="padding-bottom: 8px;">${isPending ? StatusBadge('Payment Pending', 'warning') : StatusBadge('Paid', 'success')}</td>
          </tr>
        </table>
      </div>
      
      ${ProductRows(order.items, order.currency_code)}
      ${PriceSummary(subtotal, order.discount_total || 0, order.total, order.currency_code, order.payment_status)}
    `)}

    ${siteUrl ? EmailButton('View Your Order', orderUrl(siteUrl, order.order_number)) : ''}
    ${EmailFooter(site)}
  `;

  return EmailShell(content, `We've received your bdBeginner order.`);
};

export const getOrderCreatedCustomerText = (order: OrderData, site: SiteSettings) => {
  const siteName = site.site_name || 'bdBeginner';
  return `
${siteName}

Order Received!

Hi ${order.customer_name},
Thank you for your order. We've received it and are processing it now.

Order Summary:
Order Number: ${order.order_number}
Date: ${new Date(order.created_at).toLocaleDateString()}
Status: ${order.order_status}
Payment: ${order.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}

Items:
${order.items.map(item => `- ${item.product_name} (x${item.quantity}) - ${formatPrice(item.line_total, order.currency_code)}`).join('\n')}

Grand Total: ${formatPrice(order.total, order.currency_code)}

If you have any questions, contact us at ${site.support_email || 'support@bdbeginner.com'}.
  `.trim();
};

export const getOrderCreatedAdminHtml = (order: OrderData, site: SiteSettings, siteUrl: string | undefined) => {
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle(`New Order: ${order.order_number}`)}
    
    ${InfoBox(`
      <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #0F172A;">Customer Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; margin-bottom: 24px;">
        <tr>
          <td style="color: #64748B; padding-bottom: 8px; width: 80px;">Name:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${esc(order.customer_name)}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Email:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${esc(order.customer_email)}</td>
        </tr>
      </table>
      
      <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #0F172A;">Order Summary</h3>
      <div style="margin-bottom: 16px;">
        ${order.payment_status === 'paid' ? StatusBadge('Paid', 'success') : StatusBadge('Pending', 'warning')}
      </div>
      
      ${ProductRows(order.items, order.currency_code)}
      ${PriceSummary(order.subtotal ?? order.total + (order.discount_total || 0), order.discount_total || 0, order.total, order.currency_code, order.payment_status)}
    `)}

    ${siteUrl ? EmailButton('View Order in Admin', orderUrl(siteUrl, order.order_number, true)) : ''}
    ${EmailFooter(site)}
  `;

  return EmailShell(content, `New order received: ${order.order_number}`);
};

export const getManualPaymentSubmittedHtml = (order: OrderData, site: SiteSettings, transactionId: string, method: string, siteUrl?: string) => {
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle('Payment submitted for verification')}
    ${EmailText(`Hi ${esc(order.customer_name)},`)}
    ${EmailText('We received your payment information and it is awaiting verification.')}
    
    ${InfoBox(`
      <div style="margin-bottom: 16px;">
        ${StatusBadge('Payment Verification Pending', 'warning')}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
          <td style="color: #64748B; padding-bottom: 8px; width: 120px;">Order Number:</td>
          <td style="color: #0F172A; font-weight: 500; padding-bottom: 8px;">${esc(order.order_number)}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Method:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${esc(method)}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Transaction ID:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${esc(transactionId)}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Amount:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${formatPrice(order.total, order.currency_code)}</td>
        </tr>
      </table>
    `)}

    ${siteUrl ? EmailButton('View Order', orderUrl(siteUrl, order.order_number)) : ''}
    ${EmailFooter(site)}
  `;

  return EmailShell(content, `Payment verification pending for order ${order.order_number}`);
};

export const getPaymentApprovedHtml = (order: OrderData, site: SiteSettings, transactionId?: string, method?: string, siteUrl?: string) => {
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle('Payment Confirmed')}
    ${EmailText(`Hi ${esc(order.customer_name)},`)}
    ${EmailText('Your payment has been successfully confirmed and your purchase is ready.')}
    
    ${InfoBox(`
      <div style="margin-bottom: 16px;">
        ${StatusBadge('Payment Confirmed', 'success')}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr>
          <td style="color: #64748B; padding-bottom: 8px; width: 120px;">Order Number:</td>
          <td style="color: #0F172A; font-weight: 500; padding-bottom: 8px;">${esc(order.order_number)}</td>
        </tr>
        ${method ? `
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Method:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${esc(method)}</td>
        </tr>
        ` : ''}
        ${transactionId ? `
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Transaction ID:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${esc(transactionId)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Amount Paid:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${formatPrice(order.total, order.currency_code)}</td>
        </tr>
      </table>
    `)}

    ${siteUrl ? EmailButton('Access Your Purchase', orderUrl(siteUrl, order.order_number)) : ''}
    ${EmailFooter(site)}
  `;

  return EmailShell(content, `Your payment is confirmed and your purchase is ready.`);
};

export const getPaymentRejectedHtml = (order: OrderData, site: SiteSettings, reason: string, transactionId?: string, method?: string, siteUrl?: string) => {
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle('Payment verification needs attention')}
    ${EmailText(`Hi ${esc(order.customer_name)},`)}
    ${EmailText('We were unable to verify your payment for the following order.')}
    
    ${InfoBox(`
      <div style="margin-bottom: 16px;">
        ${StatusBadge('Verification Unsuccessful', 'error')}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; margin-bottom: 16px;">
        <tr>
          <td style="color: #64748B; padding-bottom: 8px; width: 120px;">Order Number:</td>
          <td style="color: #0F172A; font-weight: 500; padding-bottom: 8px;">${esc(order.order_number)}</td>
        </tr>
        ${method ? `
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Method:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${esc(method)}</td>
        </tr>
        ` : ''}
        ${transactionId ? `
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Transaction ID:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${esc(transactionId)}</td>
        </tr>
        ` : ''}
      </table>
      <div style="background-color: #FEF2F2; padding: 12px; border-radius: 6px; border: 1px solid #FECACA; color: #991B1B; font-size: 14px;">
        <strong>Reason:</strong> ${esc(reason)}
      </div>
    `)}

    ${siteUrl ? EmailButton('Submit Payment Again', orderUrl(siteUrl, order.order_number)) : ''}
    ${EmailFooter(site)}
  `;

  return EmailShell(content, `Your payment information needs attention.`);
};

export const getProductReadyHtml = (order: OrderData, site: SiteSettings, siteUrl?: string) => {
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle('Your purchase is ready')}
    ${EmailText(`Hi ${esc(order.customer_name)},`)}
    ${EmailText(`Good news! The items from your order <strong>${esc(order.order_number)}</strong> are now available for access.`)}
    
    ${InfoBox(`
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        ${order.items.map(item => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0;">
              <span style="font-weight: 500; color: #0F172A;">${esc(item.product_name)}</span>
            </td>
          </tr>
        `).join('')}
      </table>
    `)}

    ${siteUrl ? EmailButton('Access Your Purchase', orderUrl(siteUrl, order.order_number)) : ''}
    ${EmailFooter(site)}
  `;

  return EmailShell(content, `Your bdBeginner purchase is ready for access.`);
};

export const getRefundConfirmationHtml = (order: OrderData, site: SiteSettings, siteUrl?: string) => {
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle('Refund Confirmed')}
    ${EmailText(`Hi ${esc(order.customer_name)},`)}
    ${EmailText(`Your refund for order <strong>${esc(order.order_number)}</strong> has been confirmed.`)}

    ${InfoBox(`
      <div style="margin-bottom: 16px;">${StatusBadge('Refunded', 'success')}</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
        <tr><td style="color: #64748B; padding-bottom: 8px;">Order Number:</td><td align="right" style="color: #0F172A; font-weight: 600; padding-bottom: 8px;">${esc(order.order_number)}</td></tr>
        <tr><td style="color: #64748B;">Refund Amount:</td><td align="right" style="color: #0F172A; font-weight: 600;">${formatPrice(order.total, order.currency_code)}</td></tr>
      </table>
    `)}

    ${siteUrl ? EmailButton('View Your Order', orderUrl(siteUrl, order.order_number)) : ''}
    ${EmailFooter(site)}
  `;
  return EmailShell(content, `Your refund for ${order.order_number} has been confirmed.`);
};

export const getOrderStatusUpdateHtml = (
  order: OrderData,
  site: SiteSettings,
  statusType: 'Order' | 'Fulfillment',
  statusValue: string,
  siteUrl?: string,
) => {
  const label = statusValue.replaceAll('_', ' ');
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle(`${statusType} Update`)}
    ${EmailText(`Hi ${esc(order.customer_name)},`)}
    ${EmailText(`The ${statusType.toLowerCase()} status for order <strong>${esc(order.order_number)}</strong> has been updated.`)}
    ${InfoBox(`<div style="text-align: center;">${StatusBadge(label, statusValue === 'cancelled' ? 'error' : 'neutral')}</div>`)}
    ${siteUrl ? EmailButton('View Your Order', orderUrl(siteUrl, order.order_number)) : ''}
    ${EmailFooter(site)}
  `;
  return EmailShell(content, `${statusType} status updated to ${label}.`);
};


export const getActivationEmailHtml = (data: ActivationData, site: SiteSettings) => {
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle('Your bdBeginner account is ready')}
    ${EmailText(`Hi there,`)}
    ${EmailText(`Welcome to ${esc(site.site_name || 'bdBeginner')}! We have created a secure customer account for you using <strong>${esc(data.email)}</strong>.`)}
    ${EmailText(`Set your password to access your Orders, Downloads, and Licenses.`)}
    
    ${EmailButton('Set My Password', data.action_link)}
    
    ${EmailText(`If the button doesn't work, copy and paste this secure link into your browser:<br/><a href="${esc(data.action_link)}" style="color: #2563EB; word-break: break-all;">${esc(data.action_link)}</a>`)}
    
    ${EmailFooter(site)}
  `;

  return EmailShell(content, `Set your password to access your bdBeginner purchases.`);
};

export const getActivationEmailText = (data: ActivationData, site: SiteSettings) => {
  const siteName = site.site_name || 'bdBeginner';
  return `
${siteName}

Your bdBeginner account is ready

Hi there,
Welcome to ${siteName}! We have created a customer account for you using ${data.email}.

Set your password to access your Orders, Downloads, and Licenses:
${data.action_link}

If you have any questions, contact us at ${site.support_email || 'support@bdbeginner.com'}.
  `.trim();
};

export const getReviewSubmittedAdminHtml = (review: ReviewEmailData, site: SiteSettings, siteUrl: string | undefined) => {
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle('New Product Review')}
    ${EmailText(`A new review has been submitted and is waiting for moderation.`)}
    
    ${InfoBox(`
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; margin-bottom: 16px;">
        <tr>
          <td style="color: #64748B; padding-bottom: 8px; width: 100px;">Product:</td>
          <td style="color: #0F172A; font-weight: 500; padding-bottom: 8px;">${esc(review.product?.name || 'Unknown')}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Rating:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${Math.max(1, Math.min(5, Math.round(review.rating)))} / 5</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding-bottom: 8px;">Author:</td>
          <td style="color: #0F172A; padding-bottom: 8px;">${esc(review.author_name)} (${esc(review.user?.email || 'Guest')})</td>
        </tr>
      </table>
      <div style="background-color: #F8FAFC; padding: 12px; border-radius: 6px; border: 1px solid #E2E8F0; color: #334155; font-size: 14px; font-style: italic;">
        &ldquo;${esc(review.content)}&rdquo;
      </div>
    `)}

    ${siteUrl ? EmailButton('Moderate Review', `${siteUrl}/admin/reviews`) : ''}
    ${EmailFooter(site)}
  `;

  return EmailShell(content, `A new product review requires moderation.`);
};

export const getReviewApprovedCustomerHtml = (review: ReviewEmailData, site: SiteSettings, siteUrl: string | undefined) => {
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle('Your review was published!')}
    ${EmailText(`Hi ${esc(review.author_name)},`)}
    ${EmailText(`Thank you for reviewing <strong>${esc(review.product?.name || 'our product')}</strong>. Your review is now live on our website.`)}
    
    ${InfoBox(`
      <div style="color: #F59E0B; font-size: 18px; margin-bottom: 12px; font-weight: bold;">
        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
      </div>
      <div style="color: #334155; font-size: 14px; font-style: italic;">
        &ldquo;${esc(review.content)}&rdquo;
      </div>
    `)}

    ${siteUrl && review.product?.slug ? EmailButton('View Product', `${siteUrl}/products/${encodeURIComponent(review.product.slug)}`) : ''}
    ${EmailFooter(site)}
  `;

  return EmailShell(content, `Your bdBeginner review is now live.`);
};

export const getReviewRejectedCustomerHtml = (review: ReviewEmailData, site: SiteSettings) => {
  const content = `
    ${EmailHeader(site)}
    ${EmailTitle('Update on your review')}
    ${EmailText(`Hi ${esc(review.author_name)},`)}
    ${EmailText(`Thank you for submitting a review for <strong>${esc(review.product?.name || 'our product')}</strong>.`)}
    ${EmailText(`Unfortunately, your review was not published because it did not meet our community guidelines.`)}
    
    ${review.admin_reply ? `
    ${InfoBox(`
      <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #64748B;">Reason from our team:</h3>
      <p style="margin: 0; color: #0F172A; font-size: 14px;">${esc(review.admin_reply)}</p>
    `)}
    ` : ''}

    ${EmailText(`We value your feedback and encourage you to submit a new review that follows our guidelines.`)}
    
    ${EmailFooter(site)}
  `;

  return EmailShell(content, `Update regarding your product review.`);
};
