import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt.js";
import { User } from "../models/User.js";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Access token is missing or invalid",
      },
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "Access token has expired or is invalid",
      },
    });
  }
};

export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    });
  }

  if (req.user.role === "admin") {
    return next();
  }

  try {
    const user = await User.findById(req.user.userId);
    if (user && user.role === "admin") {
      return next();
    }
  } catch (err) {
    // Ignore error
  }

  return res.status(403).json({
    success: false,
    error: {
      code: "FORBIDDEN",
      message: "Admin privileges required to perform bulk template management operations",
    },
  });
};
