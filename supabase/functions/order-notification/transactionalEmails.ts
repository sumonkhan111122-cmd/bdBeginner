import { EMAIL_TEMPLATE_VERSION, type SiteSettings } from './emailComponents.ts';
import {
  getActivationEmailHtml,
  getActivationEmailText,
  getManualPaymentSubmittedHtml,
  getOrderCreatedAdminHtml,
  getOrderCreatedCustomerHtml,
  getOrderCreatedCustomerText,
  getOrderStatusUpdateHtml,
  getPaymentApprovedHtml,
  getPaymentRejectedHtml,
  getProductReadyHtml,
  getRefundConfirmationHtml,
  type OrderData,
} from './emailTemplates.ts';

export { EMAIL_TEMPLATE_VERSION };

export type TransactionalEmailEvent =
  | 'order_received'
  | 'order_created_admin'
  | 'manual_payment_submitted'
  | 'payment_confirmed'
  | 'payment_rejected'
  | 'product_ready'
  | 'refund_confirmation'
  | 'order_status_update'
  | 'fulfillment_status_update'
  | 'account_activation';

export type TransactionalEmailBuild = {
  canonicalEvent: TransactionalEmailEvent;
  templateName: string;
  subject: string;
  html: string;
  text: string;
  pdfType: 'ORDER_SUMMARY' | 'PAID_INVOICE' | null;
};

type BuildInput = {
  eventType: TransactionalEmailEvent;
  sourceEventType?: string;
  order: OrderData;
  site: SiteSettings;
  siteUrl: string;
  transactionId?: string;
  method?: string;
  reason?: string;
  actionLink?: string;
};

const normalizeLabel = (value?: string) => value?.replaceAll('_', ' ').trim() || undefined;

export function normalizeTransactionalEvent(eventType: string): TransactionalEmailEvent | null {
  const aliases: Record<string, TransactionalEmailEvent> = {
    order_received: 'order_received',
    order_created_customer: 'order_received',
    order_created_admin: 'order_created_admin',
    manual_payment_submitted: 'manual_payment_submitted',
    payment_status_pending_customer: 'manual_payment_submitted',
    payment_confirmed: 'payment_confirmed',
    payment_approved: 'payment_confirmed',
    payment_status_paid: 'payment_confirmed',
    payment_status_paid_customer: 'payment_confirmed',
    payment_rejected: 'payment_rejected',
    payment_status_unpaid_customer: 'payment_rejected',
    payment_status_failed_customer: 'payment_rejected',
    product_ready: 'product_ready',
    fulfillment_status_fulfilled_customer: 'product_ready',
    refund_confirmation: 'refund_confirmation',
    payment_status_refunded_customer: 'refund_confirmation',
    account_activation: 'account_activation',
    account_activation_customer: 'account_activation',
  };
  if (aliases[eventType]) return aliases[eventType];
  if (/^order_status_[a-z_]+_customer$/.test(eventType)) return 'order_status_update';
  if (/^fulfillment_status_[a-z_]+_customer$/.test(eventType)) return 'fulfillment_status_update';
  return null;
}

export function buildTransactionalEmail(input: BuildInput): TransactionalEmailBuild {
  const { eventType, order, site, siteUrl } = input;
  const transactionId = input.transactionId?.trim();
  const method = normalizeLabel(input.method);

  switch (eventType) {
    case 'order_received':
      return {
        canonicalEvent: eventType,
        templateName: 'branded_order_received_v2',
        subject: `Order received — ${order.order_number} | bdBeginner`,
        html: getOrderCreatedCustomerHtml(order, site, siteUrl),
        text: getOrderCreatedCustomerText(order, site),
        pdfType: 'ORDER_SUMMARY',
      };
    case 'order_created_admin':
      return {
        canonicalEvent: eventType,
        templateName: 'branded_order_admin_v2',
        subject: `New bdBeginner order — ${order.order_number}`,
        html: getOrderCreatedAdminHtml(order, site, siteUrl),
        text: `New order ${order.order_number} was received from ${order.customer_name}. Total: ${order.total} ${order.currency_code}.`,
        pdfType: 'ORDER_SUMMARY',
      };
    case 'manual_payment_submitted':
      return {
        canonicalEvent: eventType,
        templateName: 'branded_manual_payment_submitted_v2',
        subject: `Payment submitted for verification — ${order.order_number} | bdBeginner`,
        html: getManualPaymentSubmittedHtml(order, site, transactionId || 'Submitted', method || 'Manual payment', siteUrl),
        text: `We received your payment information for ${order.order_number}. Status: Verification Pending.`,
        pdfType: null,
      };
    case 'payment_confirmed':
      return {
        canonicalEvent: eventType,
        templateName: 'branded_payment_confirmed_v2',
        subject: `Payment confirmed — ${order.order_number} | bdBeginner`,
        html: getPaymentApprovedHtml(order, site, transactionId, method, siteUrl),
        text: `Your payment for ${order.order_number} has been confirmed.`,
        pdfType: 'PAID_INVOICE',
      };
    case 'payment_rejected': {
      const reason = input.reason?.trim() || 'The submitted payment information could not be verified.';
      return {
        canonicalEvent: eventType,
        templateName: 'branded_payment_rejected_v2',
        subject: `Payment verification needs attention — ${order.order_number} | bdBeginner`,
        html: getPaymentRejectedHtml(order, site, reason, transactionId, method, siteUrl),
        text: `We were unable to verify your payment for ${order.order_number}. Reason: ${reason}`,
        pdfType: null,
      };
    }
    case 'product_ready':
      return {
        canonicalEvent: eventType,
        templateName: 'branded_product_ready_v2',
        subject: `Your purchase is ready — ${order.order_number} | bdBeginner`,
        html: getProductReadyHtml(order, site, siteUrl),
        text: `The items from your order ${order.order_number} are now available for access.`,
        pdfType: null,
      };
    case 'refund_confirmation':
      return {
        canonicalEvent: eventType,
        templateName: 'branded_refund_confirmation_v2',
        subject: `Refund confirmed — ${order.order_number} | bdBeginner`,
        html: getRefundConfirmationHtml(order, site, siteUrl),
        text: `Your refund for order ${order.order_number} has been confirmed.`,
        pdfType: null,
      };
    case 'order_status_update': {
      const status = input.sourceEventType?.replace(/^order_status_/, '').replace(/_customer$/, '') || order.order_status;
      return {
        canonicalEvent: eventType,
        templateName: 'branded_order_status_update_v2',
        subject: `Order update — ${order.order_number} | bdBeginner`,
        html: getOrderStatusUpdateHtml(order, site, 'Order', status, siteUrl),
        text: `The order status for ${order.order_number} is now ${status.replaceAll('_', ' ')}.`,
        pdfType: null,
      };
    }
    case 'fulfillment_status_update': {
      const status = input.sourceEventType?.replace(/^fulfillment_status_/, '').replace(/_customer$/, '') || 'updated';
      return {
        canonicalEvent: eventType,
        templateName: 'branded_fulfillment_status_update_v2',
        subject: `Fulfillment update — ${order.order_number} | bdBeginner`,
        html: getOrderStatusUpdateHtml(order, site, 'Fulfillment', status, siteUrl),
        text: `The fulfillment status for ${order.order_number} is now ${status.replaceAll('_', ' ')}.`,
        pdfType: null,
      };
    }
    case 'account_activation': {
      if (!input.actionLink) throw new Error('Missing account activation link');
      const activation = { email: order.customer_email, action_link: input.actionLink };
      return {
        canonicalEvent: eventType,
        templateName: 'branded_account_activation_v2',
        subject: 'Your bdBeginner account is ready',
        html: getActivationEmailHtml(activation, site),
        text: getActivationEmailText(activation, site),
        pdfType: null,
      };
    }
  }
}
