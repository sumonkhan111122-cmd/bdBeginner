import { PDFDocument, rgb, StandardFonts, PDFFont } from 'npm:pdf-lib@1.17.1';
import { OrderData, SiteSettings } from './emailTemplates.ts';

export const INVOICE_TEMPLATE_VERSION = '1.0';

const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export async function generateInvoicePdf(
  order: OrderData,
  siteSettings: SiteSettings,
  type: 'ORDER_SUMMARY' | 'PAID_INVOICE'
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  
  // Use Standard Fonts
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  
  const page = doc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  
  let currentY = height - 50;
  const margin = 50;

  // Colors based on brand guidelines
  const navy = rgb(15/255, 23/255, 42/255);
  const textMuted = rgb(100/255, 116/255, 139/255);
  const borderCol = rgb(226/255, 232/255, 240/255);

  const drawText = (text: string, x: number, y: number, font: PDFFont, size: number, color = navy) => {
    page.drawText(text, { x, y, size, font, color });
  };

  const rightAlign = (text: string, font: PDFFont, size: number) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    return width - margin - textWidth;
  };

  // Header Section
  drawText(siteSettings.site_name || 'bdBeginner', margin, currentY, fontBold, 24);
  currentY -= 15;
  drawText('Digital Products, Tools & Web Solutions', margin, currentY, fontRegular, 10, textMuted);

  // Document Title & Invoice Info
  const isPaid = type === 'PAID_INVOICE';
  const docTitle = isPaid ? 'INVOICE' : 'ORDER SUMMARY';
  
  // Reset Y for right column
  let rightY = height - 50;
  drawText(docTitle, rightAlign(docTitle, fontBold, 24), rightY, fontBold, 24);
  rightY -= 20;

  // Use the new deterministic invoice number if available, otherwise fallback
  const invoiceNumber = order.invoice_number || `INV-${order.order_number}`;
  const invStr = isPaid ? `Invoice Number: ${invoiceNumber}` : `Order Number: ${order.order_number}`;
  drawText(invStr, rightAlign(invStr, fontRegular, 10), rightY, fontRegular, 10, textMuted);
  rightY -= 15;
  
  const dateStr = `Date: ${new Date(order.created_at).toLocaleDateString()}`;
  drawText(dateStr, rightAlign(dateStr, fontRegular, 10), rightY, fontRegular, 10, textMuted);
  
  currentY -= 40;
  
  // Status Badge Simulation
  let statusText = isPaid ? 'PAID' : 'PAYMENT PENDING';
  if (order.order_status === 'refunded') {
    statusText = 'REFUNDED';
  }
  const statusColor = isPaid || statusText === 'REFUNDED' ? rgb(22/255, 101/255, 52/255) : rgb(133/255, 77/255, 14/255);
  
  drawText(statusText, rightAlign(statusText, fontBold, 12), rightY - 15, fontBold, 12, statusColor);

  // Divider
  page.drawLine({ start: { x: margin, y: currentY }, end: { x: width - margin, y: currentY }, thickness: 1, color: borderCol });
  currentY -= 30;

  // Billed To Section
  drawText('Billed To', margin, currentY, fontBold, 12);
  currentY -= 15;
  drawText(order.customer_name, margin, currentY, fontRegular, 10);
  currentY -= 15;
  drawText(order.customer_email, margin, currentY, fontRegular, 10, textMuted);
  if (order.customer_phone) {
    currentY -= 15;
    drawText(order.customer_phone, margin, currentY, fontRegular, 10, textMuted);
  }

  currentY -= 40;

  // Product Table Header
  page.drawLine({ start: { x: margin, y: currentY }, end: { x: width - margin, y: currentY }, thickness: 1, color: borderCol });
  currentY -= 15;
  drawText('Product', margin, currentY, fontBold, 10);
  drawText('Qty', width - 200, currentY, fontBold, 10);
  drawText('Amount', rightAlign('Amount', fontBold, 10), currentY, fontBold, 10);
  currentY -= 10;
  page.drawLine({ start: { x: margin, y: currentY }, end: { x: width - margin, y: currentY }, thickness: 1, color: borderCol });
  currentY -= 20;

  // Product Rows
  for (const item of order.items) {
    // Simple wrapping logic (assuming product names aren't extremely long, or truncate)
    const MAX_LEN = 55;
    let name = item.product_name;
    if (name.length > MAX_LEN) name = name.substring(0, MAX_LEN) + '...';

    drawText(name, margin, currentY, fontRegular, 10);
    drawText(item.quantity.toString(), width - 200, currentY, fontRegular, 10);
    const amountStr = formatPrice(item.line_total, order.currency_code);
    drawText(amountStr, rightAlign(amountStr, fontRegular, 10), currentY, fontRegular, 10);
    currentY -= 20;
    
    // Check for page overflow
    if (currentY < 150) {
      // For a real production app, we would add a new page here. 
      // Assuming a standard order fits on one A4 page for this phase.
    }
  }

  page.drawLine({ start: { x: margin, y: currentY }, end: { x: width - margin, y: currentY }, thickness: 1, color: borderCol });
  currentY -= 20;

  // Price Summary
  const subtotal = order.subtotal ?? order.total + (order.discount_total || 0);
  const subtotalStr = formatPrice(subtotal, order.currency_code);
  drawText('Subtotal', width - 200, currentY, fontRegular, 10, textMuted);
  drawText(subtotalStr, rightAlign(subtotalStr, fontRegular, 10), currentY, fontRegular, 10);
  currentY -= 15;

  if (order.discount_total && order.discount_total > 0) {
    const discountStr = '-' + formatPrice(order.discount_total, order.currency_code);
    drawText('Discount', width - 200, currentY, fontRegular, 10, textMuted);
    drawText(discountStr, rightAlign(discountStr, fontRegular, 10), currentY, fontRegular, 10, rgb(22/255, 101/255, 52/255));
    currentY -= 15;
  }

  currentY -= 5;
  page.drawLine({ start: { x: width - 200, y: currentY }, end: { x: width - margin, y: currentY }, thickness: 1, color: borderCol });
  currentY -= 15;

  const totalStr = formatPrice(order.total, order.currency_code);
  drawText('Total', width - 200, currentY, fontBold, 12);
  drawText(totalStr, rightAlign(totalStr, fontBold, 12), currentY, fontBold, 12);
  currentY -= 20;

  // Payment Information section
  if (isPaid || order.total === 0) {
    drawText('Payment Information', margin, currentY, fontBold, 10);
    currentY -= 15;
    
    if (order.total === 0) {
      drawText('Fully discounted / No payment required', margin, currentY, fontRegular, 10, textMuted);
    } else {
      drawText(`Method: ${order.payment_method || 'Unknown'}`, margin, currentY, fontRegular, 10, textMuted);
      currentY -= 15;
      drawText('Status: Paid', margin, currentY, fontRegular, 10, textMuted);
    }
  }

  // Footer
  drawText('Thank you for your business!', margin, 50, fontRegular, 10, textMuted);

  // Set Metadata
  doc.setTitle(docTitle);
  doc.setAuthor(siteSettings.site_name || 'bdBeginner');
  doc.setSubject('Invoice / Order Summary');
  doc.setKeywords(['bdBeginner', `invoice-template-${INVOICE_TEMPLATE_VERSION}`]);

  return await doc.save();
}
