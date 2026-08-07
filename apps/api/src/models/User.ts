import { Schema, model, Document } from "mongoose";

export interface IUserDocument extends Document {
  email: string;
  passwordHash?: string;
  googleId?: string;
  name: string;
  avatarUrl?: string;
  role: "user" | "admin";
  isVerified: boolean;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    googleId: { type: String, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    refreshTokenHash: { type: String },
  },
  { timestamps: true }
);

export const User = model<IUserDocument>("User", UserSchema);
