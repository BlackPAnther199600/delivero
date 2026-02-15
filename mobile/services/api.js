import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend configuration
// Web dev: localhost | Mobile/APK: production backend
const API_URL = __DEV__ && typeof window !== 'undefined'
  ? 'http://localhost:5000/api'
  : 'https://delivero-gyjx.onrender.com/api';

// Helper di fetch con interceptor per il token
async function makeRequest(endpoint, options = {}) {
  try {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw data || { message: 'Errore nella richiesta' };
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const authAPI = {
  register: async (email, password, name) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  login: async (email, password) => {
    try {
      const data = await makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      throw error;
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
    return makeRequest('/orders', { method: 'GET' });
  },
  getMyOrders: async () => {
    return makeRequest('/orders/my', { method: 'GET' });
  },
  create: (data) => makeRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAvailable: async () => {
    return makeRequest('/orders/available', { method: 'GET' });
  },
  trackOrder: async (id) => {
    return makeRequest(`/orders/${id}/track`, { method: 'GET' });
  },
  cancelOrder: async (id) => {
    return makeRequest(`/orders/${id}/cancel`, { method: 'PUT' });
  },
  rateOrder: async (id, data) => {
    return makeRequest(`/orders/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Rider endpoints
  getActiveRiderOrders: async () => {
    return makeRequest('/orders/rider/active', { method: 'GET' });
  },
  acceptOrder: async (id) => {
    return makeRequest(`/orders/${id}/accept`, { method: 'PUT' });
  },
  updateOrderStatus: async (id, status) => {
    return makeRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  completeOrder: async (id) => {
    return makeRequest(`/orders/${id}/complete`, { method: 'PUT' });
  },
  completeDelivery: async (id) => {
    return makeRequest(`/orders/${id}/delivered`, { method: 'PUT' });
  },

  // Real-time tracking (rider sends location)
  updateRiderLocation: async (orderId, latitude, longitude, eta_minutes) => {
    return makeRequest(`/orders/${orderId}/location`, {
      method: 'POST',
      body: JSON.stringify({
        latitude,
        longitude,
        eta_minutes
      }),
    });
  },

  // Get tracking info (customer/manager views)
  getTrackingInfo: async (orderId) => {
    return makeRequest(`/orders/${orderId}/track`, { method: 'GET' });
  },
  getTrackHistory: async (orderId) => {
    return makeRequest(`/orders/${orderId}/track-history`, { method: 'GET' });
  },

  // Manager: get all active orders with tracking
  getActiveOrdersTracking: async () => {
    return makeRequest('/orders/active/all', { method: 'GET' });
  },

  // Location sharing (riders)
  sendLocation: (location) => makeRequest('/rider/location', {
    method: 'POST',
    body: JSON.stringify(location),
  }),
  getRiderLocation: (riderId) => makeRequest(`/rider/${riderId}/location`, {
    method: 'GET',
  }),
};

export const userAPI = {
  getProfile: () => makeRequest('/user/profile', { method: 'GET' }),
  updateProfile: (data) => makeRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  setPushToken: (token) => makeRequest('/auth/push-token', {
    method: 'PUT',
    body: JSON.stringify({ push_token: token }),
  }),
};

export { makeRequest };
export default { authAPI, ordersAPI, userAPI, makeRequest };
