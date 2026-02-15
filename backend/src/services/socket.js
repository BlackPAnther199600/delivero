import { Server } from 'socket.io';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';

let io;

// Middleware: Authenticate socket connection via JWT token
const authenticateSocketMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new Error('Authentication token required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
};

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGINS ? process.env.FRONTEND_ORIGINS.split(',') : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:19007',
        'https://delivero-dubw.vercel.app'
      ],
      methods: ['GET', 'POST', 'OPTIONS']
    },
    auth: { required: true }
  });

  // Apply auth middleware
  io.use(authenticateSocketMiddleware);

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} (${socket.userRole}) connected`);

    // Join user room for receiving their order updates
    socket.on('joinUserRoom', (userId) => {
      socket.join(`user_${userId}`);
    });

    // Join managers room (only managers/admins)
    socket.on('joinManagerRoom', () => {
      if (['manager', 'admin'].includes(socket.userRole)) {
        socket.join('managers');
        console.log(`Manager ${socket.userId} joined managers room`);
      }
    });

    // Subscribe to tracking for a specific order (customer, rider, or manager)
    socket.on('joinOrderTracking', async (orderId) => {
      try {
        // Fetch order to verify authorization
        const result = await db.query(
          'SELECT id, user_id, rider_id, status FROM orders WHERE id = $1',
          [orderId]
        );

        if (result.rows.length === 0) {
          socket.emit('error', 'Order not found');
          return;
        }

        const order = result.rows[0];

        // Authorization:
        // - Customer: only their own order
        // - Rider: only orders assigned to them
        // - Manager: all orders
        const isCustomer = socket.userRole === 'customer' && order.user_id === socket.userId;
        const isRider = socket.userRole === 'rider' && order.rider_id === socket.userId;
        const isManager = ['manager', 'admin'].includes(socket.userRole);

        if (!isCustomer && !isRider && !isManager) {
          socket.emit('error', 'Not authorized for this order');
          return;
        }

        // Join order-specific room
        const roomName = `order_${orderId}`;
        socket.join(roomName);
        console.log(`User ${socket.userId} (${socket.userRole}) joined tracking for order ${orderId}`);

        // Send current order state
        socket.emit('orderTrackingState', {
          orderId,
          status: order.status,
          timestamp: new Date()
        });
      } catch (e) {
        console.error('Error in joinOrderTracking:', e);
        socket.emit('error', 'Failed to join order tracking');
      }
    });

    // Leave order tracking
    socket.on('leaveOrderTracking', (orderId) => {
      const roomName = `order_${orderId}`;
      socket.leave(roomName);
      console.log(`User ${socket.userId} left tracking for order ${orderId}`);
    });

    // Track order delivery (manual emit)
    socket.on('updateOrderStatus', (data) => {
      const { orderId, userId, status, location } = data;
      // This is for manual updates; riders should use PUT /orders/:id/location instead
      io.to(`user_${userId}`).emit('orderStatusUpdate', {
        orderId,
        status,
        location,
        timestamp: new Date()
      });
      // also notify managers
      io.to('managers').emit('activeOrderUpdate', { orderId, status, location, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Emit rider location update to all subscribers (customer + managers)
export const broadcastRiderLocation = (orderId, latitude, longitude, eta_minutes) => {
  const io = getIO();
  const roomName = `order_${orderId}`;
  io.to(roomName).emit('riderLocationUpdate', {
    orderId,
    latitude,
    longitude,
    eta_minutes,
    timestamp: new Date()
  });
  io.to('managers').emit('activeOrderUpdate', { orderId, latitude, longitude, eta_minutes, timestamp: new Date() });
};

// Emit order status change
export const broadcastOrderStatusChange = (orderId, customerId, status) => {
  const io = getIO();
  const roomName = `order_${orderId}`;
  io.to(roomName).emit('orderStatusUpdate', {
    orderId,
    status,
    timestamp: new Date()
  });
  // Stop tracking immediately after delivery for privacy
  if (status === 'delivered') {
    io.to(roomName).emit('trackingStopped', { orderId, reason: 'Order delivered' });
  }
  io.to('managers').emit('activeOrderUpdate', { orderId, status });
};

export const emitOrderUpdate = (userId, orderId, status, location = null) => {
  const io = getIO();
  io.to(`user_${userId}`).emit('orderStatusUpdate', {
    orderId,
    status,
    location,
    timestamp: new Date()
  });
};
