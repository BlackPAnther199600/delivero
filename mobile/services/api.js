import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';

// Backend configuration
// Web dev: localhost | Mobile/APK: production backend
const API_URL = __DEV__ && typeof window !== 'undefined'
  ? 'http://localhost:5000/api'
  : 'https://delivero-gyjx.onrender.com/api';

const SOCKET_URL = __DEV__ && typeof window !== 'undefined'
  ? 'http://localhost:5000'
  : 'https://delivero-gyjx.onrender.com';

let socket = null;

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

// WebSocket tracking initialization
export const initializeTrackingSocket = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.warn('No token available for socket connection');
      return null;
    }

    if (socket && socket.connected) {
      return socket;
    }

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✓ Connected to tracking socket');
    });

    socket.on('disconnect', () => {
      console.log('✗ Disconnected from tracking socket');
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    return socket;
  } catch (error) {
    console.error('Failed to initialize tracking socket:', error);
    return null;
  }
};

// Join order tracking channel
export const joinOrderTracking = async (orderId) => {
  try {
    const sock = socket || (await initializeTrackingSocket());
    if (!sock) {
      throw new Error('Socket not initialized');
    }
    sock.emit('joinOrderTracking', orderId);
  } catch (error) {
    console.error('Failed to join order tracking:', error);
    throw error;
  }
};

// Leave order tracking channel
export const leaveOrderTracking = (orderId) => {
  try {
    if (!socket) return;
    socket.emit('leaveOrderTracking', orderId);
  } catch (error) {
    console.error('Failed to leave order tracking:', error);
  }
};

// Subscribe to location updates
export const onRiderLocationUpdate = (callback) => {
  if (!socket) return () => { };
  socket.off('riderLocationUpdate'); // remove previous listeners
  socket.on('riderLocationUpdate', callback);
  return () => socket.off('riderLocationUpdate');
};

// Subscribe to order status updates  
export const onOrderStatusUpdate = (callback) => {
  if (!socket) return () => { };
  socket.off('orderStatusUpdate');
  socket.on('orderStatusUpdate', callback);
  return () => socket.off('orderStatusUpdate');
};

// Subscribe to tracking stopped (after delivery)
export const onTrackingStopped = (callback) => {
  if (!socket) return () => { };
  socket.off('trackingStopped');
  socket.on('trackingStopped', callback);
  return () => socket.off('trackingStopped');
};

// Calculate straight-line distance between two points (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // meters
};

// Calculate ETA based on distance and speed
export const calculateETA = (distanceMeters, speedMPS = 10) => {
  // Default speed ~36 km/h = 10 m/s (typical city delivery)
  const seconds = distanceMeters / speedMPS;
  const minutes = Math.ceil(seconds / 60);
  return Math.max(1, minutes); // at least 1 minute
};

// Disconnect socket
export const disconnectTrackingSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    socket = null;
  }
};

export const authAPI = {
  register: async (email, password, name, role = 'customer') => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
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
