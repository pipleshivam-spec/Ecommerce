const API_BASE = '/api';

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  logout: async () => {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return res.json();
  },

  // Products
  getProducts: async () => {
    const res = await fetch(`${API_BASE}/products`);
    return res.json();
  },

  getProduct: async (id: number) => {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return res.json();
  },

  createProduct: async (data: any) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateProduct: async (data: any) => {
    const res = await fetch(`${API_BASE}/products/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteProduct: async (id: number) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return res.json();
  },

  // Cart
  getCart: async () => {
    const res = await fetch(`${API_BASE}/cart`, { credentials: 'include' });
    return res.json();
  },

  addToCart: async (product_id: number, quantity: number = 1) => {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ product_id, quantity })
    });
    return res.json();
  },

  removeFromCart: async (id: number) => {
    const res = await fetch(`${API_BASE}/cart/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return res.json();
  },

// Checkout & Orders
  getUserOrders: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/checkout/orders`, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    return res.json();
  },

  processCheckout: async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/checkout/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Payment
  createMockPayment: async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/payment/mock/create-order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  verifyMockPayment: async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/payment/mock/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },


  // Admin
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, { credentials: 'include' });
    return res.json();
  }
};
