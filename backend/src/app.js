import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
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
import { initializeSocket } from "./services/socket.js";
import { authenticateToken } from "./middleware/auth.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

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

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Routes
app.use("/api/auth", authRoutes);
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
  console.error(err.stack);
  res.status(500).json({ message: "Errore del server", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);

export default server;
