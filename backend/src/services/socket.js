import { Server } from 'socket.io';

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGINS ? process.env.FRONTEND_ORIGINS.split(',') : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:19007'
      ],
      methods: ['GET', 'POST', 'OPTIONS']
    }
  });

  io.on('connection', (socket) => {
    // Connection established

    // Join user room for receiving their order updates
    socket.on('joinUserRoom', (userId) => {
      socket.join(`user_${userId}`);
    });

    // Join managers room
    socket.on('joinManagerRoom', () => {
      socket.join('managers');
    });

    // Track order delivery (manual emit)
    socket.on('updateOrderStatus', (data) => {
      const { orderId, userId, status, location } = data;
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
      // socket disconnected
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

export const emitOrderUpdate = (userId, orderId, status, location = null) => {
  const io = getIO();
  io.to(`user_${userId}`).emit('orderStatusUpdate', {
    orderId,
    status,
    location,
    timestamp: new Date()
  });
};
