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
    if (data.success) toast.success(`Order confirmation sent to ${order.user_email}`);
  } catch {
    // silent — order is already placed
  }
};

export const sendOrderStatusEmail = async (order: Order): Promise<void> => {
  await sendOrderConfirmationEmail(order);
};
