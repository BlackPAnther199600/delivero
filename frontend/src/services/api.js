import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://delivero-gyjx.onrender.com/api';

const getToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : null;
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (email, password, name, role = 'customer') => apiClient.post('/auth/register', { email, password, name, role }),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getCurrentUser: () => apiClient.get('/auth/me')
};

// Orders
export const ordersAPI = {
  getAll: async () => {
    const res = await apiClient.get('/orders');
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },
  getMyOrders: async () => {
    const res = await apiClient.get('/orders/my');
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/orders', data);
    return res.data;
  },
  updateStatus: async (id, status, location) => {
    const res = await apiClient.put(`/orders/${id}/status`, { status, location });
    return res.data;
  },

  // Customer endpoints
  getAvailable: async () => {
    const res = await apiClient.get('/orders/available');
    return res.data;
  },
  trackOrder: async (id) => {
    const res = await apiClient.get(`/orders/${id}/track`);
    return res.data;
  },
  cancelOrder: async (id) => {
    const res = await apiClient.put(`/orders/${id}/cancel`);
    return res.data;
  },
  rateOrder: async (id, data) => {
    const res = await apiClient.post(`/orders/${id}/rate`, data);
    return res.data;
  },

  // Rider endpoints
  getActiveRiderOrders: async () => {
    const res = await apiClient.get('/orders/rider/active');
    return res.data;
  },
  acceptOrder: async (id) => {
    const res = await apiClient.put(`/orders/${id}/accept`);
    return res.data;
  },
  completeDelivery: async (id) => {
    const res = await apiClient.put(`/orders/${id}/delivered`);
    return res.data;
  },
  getActiveOrdersTracking: async () => {
    const res = await apiClient.get('/orders/active/all');
    return res.data;
  }
};

// Track history endpoint
ordersAPI.getTrackHistory = async (orderId) => {
  const res = await apiClient.get(`/orders/${orderId}/track-history`);
  return res.data;
};

// Bills
export const billsAPI = {
  getAll: () => apiClient.get('/bills'),
  create: (data) => apiClient.post('/bills', data),
  delete: (id) => apiClient.delete(`/bills/${id}`)
};

// Payments
export const paymentsAPI = {
  createPayment: (orderId, amount) => apiClient.post('/payments/create', { orderId, amount }),
  confirmPayment: (paymentIntentId, orderId) => apiClient.post('/payments/confirm', { paymentIntentId, orderId })
};

// Admin
export const adminAPI = {
  getStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },
  getAllOrders: async () => {
    const res = await apiClient.get('/admin/orders');
    return res.data;
  },
  getAllUsers: async () => {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },
  getFinanceReport: async () => {
    const res = await apiClient.get('/admin/finance');
    return res.data;
  },
  getServiceMetrics: async () => {
    const res = await apiClient.get('/admin/metrics');
    return res.data;
  },
  getTicketStats: async () => {
    const res = await apiClient.get('/admin/tickets/stats');
    return res.data;
  },
  updateUserRole: (userId, newRole) => apiClient.put(`/admin/users/${userId}/role`, { newRole }),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`)
};

// Tickets
export const ticketsAPI = {
  create: (data) => apiClient.post('/tickets', data),
  getAll: () => apiClient.get('/tickets'),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  updateStatus: (id, status) => apiClient.put(`/tickets/${id}/status`, { status }),
  addComment: (id, comment) => apiClient.post(`/tickets/${id}/comments`, { comment }),
  getAdminTickets: () => apiClient.get('/tickets/admin')
};

export default apiClient;

// User helpers
export const userAPI = {
  setPushToken: async (token) => {
    const res = await apiClient.put('/auth/push-token', { push_token: token });
    return res.data;
  }
};
