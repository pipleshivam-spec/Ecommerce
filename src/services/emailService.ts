import emailjs from '@emailjs/browser';
import { Order } from '@/hooks/useOrders';
import { toast } from 'sonner';

const SERVICE_ID        = import.meta.env.VITE_EMAILJS_SERVICE_ID        as string;
const TEMPLATE_ID_ORDER = import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID as string;
const TEMPLATE_ID_OTP   = import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID   as string;
const PUBLIC_KEY        = import.meta.env.VITE_EMAILJS_PUBLIC_KEY         as string;

const isConfigured =
  SERVICE_ID && SERVICE_ID !== 'YOUR_SERVICE_ID' &&
  PUBLIC_KEY && PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';

// ─── Order Confirmation Email ─────────────────────────────────────────────────
export const sendOrderConfirmationEmail = async (order: Order): Promise<void> => {
  if (!order.user_email) return;

  if (!isConfigured) {
    console.warn('EmailJS not configured. Fill in .env variables — see README or emailService.ts.');
    toast.info('Order placed! (Email service not configured yet)');
    return;
  }

  const itemsList = order.items
    .map(i => `${i.product_name} x${i.quantity} — ₹${i.total.toFixed(2)}`)
    .join('\n');

  const shippingAddress = [
    order.shipping_name,
    order.shipping_address_line1,
    order.shipping_address_line2,
    `${order.shipping_city}, ${order.shipping_state} - ${order.shipping_postal_code}`,
    order.shipping_country,
  ].filter(Boolean).join('\n');

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID_ORDER, {
      to_email:         order.user_email,
      to_name:          order.user_name,
      order_number:     order.order_number,
      order_total:      `₹${order.total_amount.toFixed(2)}`,
      order_items:      itemsList,
      shipping_address: shippingAddress,
      payment_method:   order.payment_method.replace('_', ' ').toUpperCase(),
    }, PUBLIC_KEY);
    toast.success(`Order confirmation sent to ${order.user_email}`);
  } catch (err: any) {
    console.error('EmailJS error:', err);
    toast.error('Order placed! (Could not send confirmation email)');
  }
};

// ─── OTP Email ────────────────────────────────────────────────────────────────
export const sendOtpEmail = async (
  email: string,
  name: string,
  otp: string
): Promise<boolean> => {
  if (!isConfigured) {
    console.info(`[DEV] OTP for ${email}: ${otp}`);
    toast.info(`EmailJS not configured. Check console for OTP.`);
    return true;
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID_OTP, {
      to_email: email,
      to_name:  name,
      otp_code: otp,
    }, PUBLIC_KEY);
    return true;
  } catch (err: any) {
    console.error('OTP email error:', err);
    toast.error('Failed to send verification code. Please try again.');
    return false;
  }
};
