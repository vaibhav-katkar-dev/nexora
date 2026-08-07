import { Request, Response } from "express";
import { User } from "../models/User.js";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = RegisterSchema.parse(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: "EMAIL_EXISTS", message: "User with this email already exists" },
      });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      isVerified: true,
    });

    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email, role: user.role });

    user.refreshTokenHash = await hashPassword(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        accessToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Validation error", details: error.errors },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
      });
    }

    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email, role: user.role || "user" });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email, role: user.role || "user" });

    user.refreshTokenHash = await hashPassword(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role || "user", avatarUrl: user.avatarUrl },
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Validation error", details: error.errors },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message },
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: "NO_REFRESH_TOKEN", message: "Refresh token missing" },
      });
    }

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_REFRESH_TOKEN", message: "User not found or session revoked" },
      });
    }

    const isMatch = await comparePassword(token, user.refreshTokenHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_REFRESH_TOKEN", message: "Token reuse detected or invalidated" },
      });
    }

    const newAccessToken = generateAccessToken({ userId: user._id.toString(), email: user.email, role: user.role || "user" });
    const newRefreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email, role: user.role || "user" });

    user.refreshTokenHash = await hashPassword(newRefreshToken);
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_REFRESH_TOKEN", message: "Invalid or expired refresh token" },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await User.findByIdAndUpdate(payload.userId, { $unset: { refreshTokenHash: 1 } });
      } catch (err) {
        // Token already invalid
      }
    }

    clearRefreshCookie(res);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message },
    });
  }
};

// GET /api/v1/auth/me — returns current authenticated user
export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select("-passwordHash -refreshTokenHash").lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      });
    }
    res.json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: (user as any).role || "user", avatarUrl: (user as any).avatarUrl } },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message },
    });
  }
};
