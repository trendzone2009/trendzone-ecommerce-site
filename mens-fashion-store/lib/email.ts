// Email service utilities using Gmail SMTP via Nodemailer
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  subtotal: number;
  shippingCharge: number;
  total: number;
  paymentMethod: string;
}

interface OrderStatusUpdateData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string;
  estimatedDelivery?: string;
}

// Send email using Gmail SMTP via Nodemailer
export async function sendEmail({ to, subject, html }: EmailOptions) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const fromEmail = process.env.EMAIL_FROM || gmailUser;

  if (!gmailUser || !gmailAppPassword) {
    console.warn('Gmail credentials not configured. Email not sent.');
    console.warn('Please set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Create transporter with Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Men's Fashion Store" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Format price in INR
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format status for display
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate order confirmation email HTML
export function generateOrderConfirmationEmail(data: OrderEmailData): string {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 12px; vertical-align: middle;">
        <span style="vertical-align: middle;">${item.name}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.size}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Order Confirmed!</h1>
              <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 16px;">Thank you for your order</p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
                Hi <strong>${data.customerName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
                Your order has been confirmed and will be shipped soon.
              </p>

              <!-- Order Number -->
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Order Number</p>
                <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700; color: #111827;">${data.orderNumber}</p>
              </div>

              <!-- Order Items -->
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">Order Items</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Product</th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Size</th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Price</th>
                    <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Order Summary -->
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Subtotal</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #111827; text-align: right;">${formatPrice(data.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Shipping</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #111827; text-align: right;">${formatPrice(data.shippingCharge)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb;">Total</td>
                    <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: 700; color: #667eea; text-align: right; border-top: 2px solid #e5e7eb;">${formatPrice(data.total)}</td>
                  </tr>
                </table>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">
                  Payment Method: <strong>${data.paymentMethod}</strong>
                </p>
              </div>

              <!-- Shipping Address -->
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #111827;">Shipping Address</h2>
              <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #111827; line-height: 1.6;">
                  <strong>${data.shippingAddress.name}</strong><br>
                  ${data.shippingAddress.addressLine1}<br>
                  ${data.shippingAddress.addressLine2 ? `${data.shippingAddress.addressLine2}<br>` : ''}
                  ${data.shippingAddress.landmark ? `${data.shippingAddress.landmark}<br>` : ''}
                  ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.pincode}
                </p>
              </div>

              <!-- What's Next -->
              <div style="background-color: #eff6ff; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1e40af;">What's Next?</h3>
                <p style="margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.6;">
                  We're processing your order and will send you a shipping confirmation email once it's on the way.
                  Estimated delivery: <strong>3-5 business days</strong>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px; background-color: #f9fafb; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
                Questions? Contact us at <a href="mailto:support@mensfashion.com" style="color: #667eea; text-decoration: none;">support@mensfashion.com</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Men's Fashion Store. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate order status update email HTML
export function generateOrderStatusEmail(data: OrderStatusUpdateData): string {
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };

  const statusMessages: Record<string, string> = {
    pending: 'We have received your order and will start processing it soon.',
    processing: 'Your order is being prepared for shipment.',
    shipped: 'Your order is on its way! You should receive it soon.',
    delivered: 'Your order has been delivered. We hope you enjoy your purchase!',
    cancelled: 'Your order has been cancelled. If you have any questions, please contact us.',
  };

  const color = statusColors[data.newStatus.toLowerCase()] || '#6b7280';
  const message = statusMessages[data.newStatus.toLowerCase()] || 'Your order status has been updated.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update - ${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${color}; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Order ${formatStatus(data.newStatus)}</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Order #${data.orderNumber}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
                Hi <strong>${data.customerName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
                ${message}
              </p>

              <!-- Status Change -->
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width: 45%; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Previous Status</p>
                      <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #9ca3af;">${formatStatus(data.oldStatus)}</p>
                    </td>
                    <td style="width: 10%; text-align: center;">
                      <span style="font-size: 20px; color: #6b7280;">→</span>
                    </td>
                    <td style="width: 45%; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">New Status</p>
                      <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: ${color};">${formatStatus(data.newStatus)}</p>
                    </td>
                  </tr>
                </table>
              </div>

              ${data.estimatedDelivery ? `
              <!-- Estimated Delivery -->
              <div style="background-color: #ecfdf5; padding: 16px; border-left: 4px solid #10b981; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #065f46;">
                  <strong>Estimated Delivery:</strong> ${data.estimatedDelivery}
                </p>
              </div>
              ` : ''}

              <!-- CTA Button -->
              ${data.newStatus.toLowerCase() !== 'cancelled' ? `
              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products"
                   style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Continue Shopping
                </a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px; background-color: #f9fafb; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
                Need help? Contact us at <a href="mailto:support@mensfashion.com" style="color: #667eea; text-decoration: none;">support@mensfashion.com</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Men's Fashion Store. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const html = generateOrderConfirmationEmail(data);

  return await sendEmail({
    to: data.customerEmail,
    subject: `Order Confirmation - ${data.orderNumber}`,
    html,
  });
}

// Send order status update email
export async function sendOrderStatusUpdateEmail(data: OrderStatusUpdateData) {
  const html = generateOrderStatusEmail(data);

  return await sendEmail({
    to: data.customerEmail,
    subject: `Order ${formatStatus(data.newStatus)} - ${data.orderNumber}`,
    html,
  });
}
