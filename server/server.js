import dotenv from "dotenv";
dotenv.config();

import express        from "express";
import { createServer } from "http";
import { Server }     from "socket.io";
import cors           from "cors";
import helmet         from "helmet";
import rateLimit      from "express-rate-limit";

// Config
import connectDatabase from "./config/database.js";

// Routes
import authRoutes         from "./routes/authRoutes.js";
import userRoutes         from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes      from "./routes/messageRoutes.js";

// Socket
import { initializeSocket } from "./socket/socketHandler.js";

// Seeder
import { seedAdmin } from "./controllers/authController.js";

const app        = express();
const httpServer = createServer(app);

// ── Allowed origins ───────────────────────────────────────────────────────────
const envFrontendUrls = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:3000",
  "https://messagetalk.vercel.app",
  ...envFrontendUrls,
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

// ── Security headers (helmet) ─────────────────────────────────────────────────
// Helps protect against well-known web vulnerabilities (XSS, clickjacking, etc.)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow avatar images
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, cb) =>
      isAllowedOrigin(origin) ? cb(null, true) : cb(new Error("CORS blocked: " + origin)),
    credentials: true,
  })
);

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "5mb" }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Auth endpoints: 10 attempts per 15 min per IP  → prevents brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { detail: "Too many attempts, please try again after 15 minutes." },
});

// General API: 200 req / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
});

app.use("/api/auth", authLimiter);
app.use("/api/",     apiLimiter);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) =>
      isAllowedOrigin(origin) ? cb(null, true) : cb(new Error("CORS blocked: " + origin)),
    methods:     ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
initializeSocket(io);

// ── Health / test routes ──────────────────────────────────────────────────────
app.get("/api/", (_req, res) =>
  res.json({ message: "MsgMate API v1.0", status: "running", timestamp: new Date().toISOString() })
);

app.get("/api/health", (_req, res) =>
  res.json({ status: "healthy", timestamp: new Date().toISOString() })
);

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages",      messageRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
// Catches any unhandled errors and returns a clean JSON response instead of
// leaking stack traces to the client (important for security & professionalism)
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ detail: err.message || "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8001;

const startServer = async () => {
  try {
    await connectDatabase();
    await seedAdmin();
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket server ready`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Server startup error:", error);
    process.exit(1);
  }
};

startServer();