import "./env.js";
import mongoose from "mongoose";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
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

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Vercel/proxied deployments inject X-Forwarded-For; trust the first hop so
// express-rate-limit can resolve the real client IP (fixes ERR_ERL_UNEXPECTED_X_FORWARDED_FOR).
app.set("trust proxy", 1);

// Connect Database (cached — safe for Vercel serverless)
connectDB();

// Security Middlewares
app.use(helmet());

// Build allowed origins from env — comma-separated ALLOWED_ORIGINS + CLIENT_URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()) : []),
].filter(Boolean) as string[];

// Known platform root domains for multi-tenant subdomains
const platformRootDomains: string[] = [
  "okinsite.com",
  "okinsite.site",
  "oninsite.com",
  "oninsite.site",
];
[process.env.CLIENT_URL, process.env.SITE_BASE_URL].filter(Boolean).forEach((url) => {
  try {
    const host = new URL(url!).hostname.toLowerCase().replace(/^www\./, "");
    if (host && !platformRootDomains.includes(host)) platformRootDomains.push(host);
  } catch {}
});

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return true;

  // 1️⃣ Exact match from CLIENT_URL or ALLOWED_ORIGINS env vars
  if (allowedOrigins.includes(origin)) return true;

  // 2️⃣ Localhost / 127.0.0.1 for local development
  if (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("https://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("https://127.0.0.1:") ||
    origin === "http://localhost" ||
    origin === "https://localhost"
  ) {
    return true;
  }

  // 3️⃣ Wildcard platform subdomains: *.okinsite.com, *.okinsite.site, *.oninsite.com, *.oninsite.site
  // e.g. lakshmikirana.okinsite.com, mybrand.okinsite.com, cafe.okinsite.site
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();

    // Vercel deployment previews
    if (hostname.endsWith(".vercel.app")) return true;

    for (const root of platformRootDomains) {
      // Matches the root domain itself (e.g. okinsite.com) OR any subdomain (*.okinsite.com)
      if (hostname === root || hostname.endsWith(`.${root}`)) return true;
    }

    // 4️⃣ External custom domains connected by users (e.g. https://www.mybrand.com)
    // These call /projects/public/:slug which is a public, unauthenticated endpoint.
    // Any valid http or https origin is permitted.
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return true;
    }
  } catch {}

  return false;
}

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      // Explicitly reflect the requesting origin so browser CORS matches exactly
      callback(null, origin || true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-refresh-token",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["Content-Disposition", "Content-Type", "Content-Length"],
  maxAge: 86400, // Cache preflight response for 24 hours
});

app.use(corsMiddleware);
app.options("*", corsMiddleware);

// Force Vary: Origin on every response so that intermediate CDNs / caches
// partition responses per unique origin.
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.vary("Origin");
  next();
});
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
