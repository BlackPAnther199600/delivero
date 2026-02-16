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
import { initializeSocket } from "./services/socket.js";
import { authenticateToken } from "./middleware/auth.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Initialize Socket.IO
initializeSocket(server);

// Middleware
const frontendOrigin = process.env.FRONTEND_URL || "https://delivero-dubw.vercel.app";

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like curl, mobile)
    if (!origin) return callback(null, true);
    if (origin === frontendOrigin) return callback(null, true);
    return callback(new Error("CORS policy: origin not allowed"), false);
  },
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
  ],
  credentials: true, // se usi cookie / authentication basata su cookie; altrimenti può essere false
};

app.use(cors(corsOptions));

// assicurati che OPTIONS venga gestita prima dei route handlers
app.options("*", cors(corsOptions));

// Rate limiting
app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
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
