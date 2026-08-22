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

// Vercel/proxied deployments inject X-Forwarded-For; trust the first hop so
// express-rate-limit can resolve the real client IP (fixes ERR_ERL_UNEXPECTED_X_FORWARDED_FOR).
app.set("trust proxy", 1);

// Connect Database (cached — safe for Vercel serverless)
connectDB();

// Security Middlewares
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://Oninsitev.vercel.app",
  "https://okinsite.com",
  "https://www.okinsite.com",
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
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Global Rate Limiter — configurable via env, generous by default to avoid
// false "too many requests" on active pages (e.g. the admin template manager,
// which issues many search/filter/pagination API calls).
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10); // 15 min
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "2000", 10);              // 2000 req / window

const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP, please try again later.",
    },
  },
});

// Apply the limiter only to /api/v1 routes (skip /health and /preview which are lightweight).
app.use("/api/v1", globalLimiter);

// Health Check Route (registered before the DB middleware so it always responds fast)
app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "AI Digital Presence Platform API operational",
    timestamp: new Date().toISOString(),
    db: mongooseConnectionState(),
  });
});

// Database readiness middleware — ensures the Mongoose connection is established
// before API handlers run. Fixes "Cannot call users.findOne() before initial
// connection is complete" on Vercel serverless cold starts (bufferCommands=false).
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: {
          code: "DB_UNAVAILABLE",
          message: "Database connection unavailable. Please try again shortly.",
        },
      });
    }
    next();
  } catch (err) {
    next(err);
  }
});

import domainRoutes from "./routes/domainRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// Route Registrations
app.use("/", sitemapRoutes);                     // Mount /sitemap.xml, /sitemaps/*.xml, /robots.txt
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/domains", domainRoutes);        // Custom domain endpoints
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/projects", publishRoutes);   // publish & deployments nested under projects
app.use("/api/v1/forms", formRoutes);            // Form submissions & leads management
app.use("/api/v1/analytics", analyticsRoutes);  // Site traffic & engagement analytics
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/templates", templateRoutes);
app.use("/preview", previewRoutes);            // Public site preview (no auth)

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
