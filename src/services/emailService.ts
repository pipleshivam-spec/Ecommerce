import { Order } from '@/hooks/useOrders';
import { toast } from 'sonner';

const API_URL = import.meta.env.DEV
  ? '/api/send-email'
  : 'https://ecommerce-production-dc30.up.railway.app/api/send-email';

export const sendOrderConfirmationEmail = async (order: Order): Promise<void> => {
  if (!order.user_email) return;

  const timeout = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 5000)
  );

  const send = async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (res.ok) toast.success(`Order confirmation sent to ${order.user_email}`);
  };

  try {
    await Promise.race([send(), timeout]);
  } catch (err: any) {
    console.error('Email error:', err);
    // Silent fail — don't block checkout
  }
};
