import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auto-detect: use localhost for web, use LAN IP for mobile emulator/device
const API_URL = __DEV__ && typeof window !== 'undefined'
  ? 'https://delivero-gyjx.onrender.com/api'
  : 'http://192.168.1.5:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Aggiungi token ai request
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Errore nel recuperare il token:', e);
  }
  return config;
});

export const authAPI = {
  register: async (email, password, name) => {
    try {
      const response = await apiClient.post('/auth/register', { email, password, name });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Errore nella registrazione' };
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Errore nel login' };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }
};

export const ordersAPI = {
  // Customer endpoints
  getAll: async () => {
    const res = await apiClient.get('/orders');
    return res.data;
  },
  getMyOrders: async () => {
    const res = await apiClient.get('/orders/my');
    return res.data;
  },
  create: (data) => apiClient.post('/orders', data),
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
  updateOrderStatus: async (id, status) => {
    const res = await apiClient.put(`/orders/${id}/status`, { status });
    return res.data;
  },
  completeOrder: async (id) => {
    const res = await apiClient.put(`/orders/${id}/complete`);
    return res.data;
  },
  completeDelivery: async (id) => {
    const res = await apiClient.put(`/orders/${id}/delivered`);
    return res.data;
  },

  // Real-time tracking (rider sends location)
  updateRiderLocation: async (orderId, latitude, longitude, eta_minutes) => {
    const res = await apiClient.post(`/orders/${orderId}/location`, {
      latitude,
      longitude,
      eta_minutes
    });
    return res.data;
  },

  // Get tracking info (customer/manager views)
  getTrackingInfo: async (orderId) => {
    const res = await apiClient.get(`/orders/${orderId}/track`);
    return res.data;
  },
  getTrackHistory: async (orderId) => {
    const res = await apiClient.get(`/orders/${orderId}/track-history`);
    return res.data;
  },

  // Manager: get all active orders with tracking
  getActiveOrdersTracking: async () => {
    const res = await apiClient.get('/orders/active/all');
    return res.data;
  },

  // Location sharing (riders)
  sendLocation: (location) => apiClient.post('/rider/location', location),
  getRiderLocation: (riderId) => apiClient.get(`/rider/${riderId}/location`),
};

export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  setPushToken: (token) => apiClient.put('/auth/push-token', { push_token: token }),
};

export default apiClient;
