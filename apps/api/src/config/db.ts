import mongoose from "mongoose";

const DEFAULT_DB = "ai-digital-presence";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cached;

/** Ensure Atlas URI includes a database name and standard query params. */
export function normalizeMongoUri(uri: string): string {
  const trimmed = uri.trim();
  if (!trimmed) return `mongodb://localhost:27017/${DEFAULT_DB}`;

  const hasDatabase = /mongodb(?:\+srv)?:\/\/[^/?#]+\/[^/?#]+/.test(trimmed);
  let normalized = hasDatabase
    ? trimmed
    : `${trimmed.replace(/\/$/, "")}/${DEFAULT_DB}`;

  if (!/[?&]retryWrites=/.test(normalized)) {
    normalized += normalized.includes("?") ? "&retryWrites=true&w=majority" : "?retryWrites=true&w=majority";
  }

  return normalized;
}

export const connectDB = async (): Promise<typeof mongoose | null> => {
  if (cached.conn) return cached.conn;

  const mongoUri = normalizeMongoUri(
    process.env.MONGODB_URI || `mongodb://localhost:27017/${DEFAULT_DB}`
  );

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
      maxPoolSize: process.env.VERCEL ? 1 : 10,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected successfully");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    const message = (error as Error).message;
    console.error("⚠️ MongoDB connection error:", message);

    if (message.includes("querySrv") || message.includes("ECONNREFUSED")) {
      console.warn(
        "👉 DNS SRV lookup failed. Use a standard mongodb:// URI (not mongodb+srv://) — see apps/api/.env.example"
      );
    }
    if (message.includes("bad auth") || message.includes("Authentication failed")) {
      console.warn("👉 Check MONGODB_URI username/password in apps/api/.env or Vercel env vars");
    }
    if (message.includes("IP") || message.includes("whitelist")) {
      console.warn("👉 Add 0.0.0.0/0 to MongoDB Atlas Network Access for Vercel deployments");
    }

    return null;
  }
};
