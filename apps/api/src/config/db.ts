import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-digital-presence";
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("⚠️ MongoDB connection error:", (error as Error).message);
    console.warn("👉 Please configure a valid MONGODB_URI in apps/api/.env");
  }
};
