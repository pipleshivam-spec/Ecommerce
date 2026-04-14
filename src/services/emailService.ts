import { Order } from '@/hooks/useOrders';
import { toast } from 'sonner';

export const sendOrderConfirmationEmail = async (order: Order): Promise<void> => {
  if (!order.user_email) return;

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send email');
    toast.success(`Order confirmation sent to ${order.user_email}`);
  } catch (err: any) {
    console.error('Email error:', err);
    toast.error(`Could not send confirmation email: ${err.message}`);
  }
};
