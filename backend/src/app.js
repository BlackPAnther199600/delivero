import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import http from "http";
import logger from "./utils/logger.js";
import { generalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import billRoutes from "./routes/bills.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";
import billPaymentsRoutes from "./routes/billPayments.js";
import pharmaciesRoutes from "./routes/pharmacies.js";
import medicalTransportsRoutes from "./routes/medicalTransports.js";
import documentPickupsRoutes from "./routes/documentPickups.js";
import ticketsRoutes from "./routes/tickets.js";
import restaurantsRoutes from "./routes/restaurants.js";
import notificationsRoutes from "./routes/notifications.js";
import { initializeSocket } from "./services/socket.js";
import { authenticateToken } from "./middleware/auth.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const frontendOrigin = process.env.NODE_ENV === 'production'
  ? 'https://delivero-dubw.vercel.app'
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:19007'];

app.use(cors({
  origin: frontendOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Initialize Socket.IO
initializeSocket(server);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/restaurants", restaurantsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bill-payments", billPaymentsRoutes);
app.use("/api/pharmacies", pharmaciesRoutes);
app.use("/api/medical-transports", medicalTransportsRoutes);
app.use("/api/document-pickups", documentPickupsRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/notifications", notificationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ message: "Errore del server", error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Route not found" });
});

server.listen(process.env.PORT || 5000, () => {
  logger.info(`Server running on port ${process.env.PORT || 5000}`);
});

export default server;
