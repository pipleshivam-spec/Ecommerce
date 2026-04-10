export interface OrderItem {
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: OrderItem[];
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'paid';
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  created_at: string;
  updated_at: string;
}

const ORDERS_KEY = 'ecom_orders';

export const getAllOrders = (): Order[] => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveOrder = (order: Order): void => {
  const orders = getAllOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const getUserOrders = (userId: string): Order[] => {
  return getAllOrders().filter(o => o.user_id === userId);
};

export const updateOrderStatus = (orderId: string, status: Order['status']): void => {
  const orders = getAllOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    orders[idx].updated_at = new Date().toISOString();
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};

export const createOrder = (
  cartItems: { product: { id: number; name: string; image: string; price: number }; quantity: number }[],
  address: {
    name: string; phone: string; address_line1: string; address_line2?: string;
    city: string; state: string; postal_code: string; country: string;
  },
  paymentMethod: string
): Order => {
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : { id: 'guest', name: 'Guest', email: 'guest@demo.com' };

  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping_amount = subtotal > 500 ? 0 : 50;
  const tax_amount = subtotal * 0.18;
  const total_amount = subtotal + shipping_amount + tax_amount;

  const order: Order = {
    id: `ord_${Date.now()}`,
    order_number: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
    user_id: String(user.id),
    user_name: user.name,
    user_email: user.email,
    items: cartItems.map(i => ({
      product_id: i.product.id,
      product_name: i.product.name,
      product_image: i.product.image,
      quantity: i.quantity,
      price: i.product.price,
      total: i.product.price * i.quantity,
    })),
    subtotal,
    shipping_amount,
    tax_amount,
    total_amount,
    status: 'confirmed',
    payment_status: 'paid',
    payment_method: paymentMethod,
    shipping_name: address.name,
    shipping_phone: address.phone,
    shipping_address_line1: address.address_line1,
    shipping_address_line2: address.address_line2,
    shipping_city: address.city,
    shipping_state: address.state,
    shipping_postal_code: address.postal_code,
    shipping_country: address.country,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveOrder(order);
  reduceStock(cartItems);
  return order;
};

export const reduceStock = (
  cartItems: { product: { id: number }; quantity: number }[]
): void => {
  try {
    const adminProducts = JSON.parse(localStorage.getItem('admin_products') || '[]');
    const updated = adminProducts.map((p: { id: number; stock: number }) => {
      const item = cartItems.find(i => i.product.id === p.id);
      return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
    });
    localStorage.setItem('admin_products', JSON.stringify(updated));
  } catch {}
};
