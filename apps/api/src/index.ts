import mongoose from "mongoose";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import publishRoutes from "./routes/publishRoutes.js";
import previewRoutes from "./routes/previewRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";

// Load .env from apps/api (works with turbo monorepo root or api cwd)
const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "apps/api/.env"),
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
dotenv.config(envPath ? { path: envPath } : undefined);

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Connect Database (cached — safe for Vercel serverless)
connectDB();

// Security Middlewares
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Global Rate Limiter (100 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP, please try again later.",
    },
  },
});
app.use(globalLimiter);

// Route Registrations
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/projects", publishRoutes);   // publish & deployments nested under projects
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/templates", templateRoutes);
app.use("/preview", previewRoutes);            // Public site preview (no auth)

// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "AI Digital Presence Platform API operational",
    timestamp: new Date().toISOString(),
    db: mongooseConnectionState(),
  });
});

function mongooseConnectionState(): string {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] ?? "unknown";
}

// Standard Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[API Error]", err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected internal server error occurred",
    },
  });
});

// Local dev: start HTTP server. Vercel: export app as serverless handler.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on port ${PORT}`);
  });
}

export default app;
