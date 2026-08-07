import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { Media } from "../models/Media.js";

// ─── Configure Cloudinary ────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ─── Multer — in-memory storage (no disk write) ──────────────────────────────
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (JPEG, PNG, WebP, GIF, SVG)"));
    }
  },
}).single("file");

// ─── Upload to Cloudinary (stream from memory buffer) ────────────────────────
function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  userId: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `presence-ai/${userId}/${folder}`,
        transformation: [
          { quality: "auto", fetch_format: "auto" }, // Auto-convert to WebP/AVIF
          { width: 1600, crop: "limit" },              // Cap max width
        ],
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

// ─── POST /api/v1/media/upload ────────────────────────────────────────────────
export const uploadMedia = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_FILE", message: "No file uploaded" },
      });
    }

    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      "media",
      req.user!.userId
    );

    const media = await Media.create({
      userId: req.user!.userId,
      projectId: req.body.projectId || undefined,
      fileName: req.file.originalname,
      cloudinaryId: publicId,
      url,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: { id: media._id, url: media.url, fileName: media.fileName },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "UPLOAD_FAILED", message: error.message },
    });
  }
};

// ─── GET /api/v1/media ────────────────────────────────────────────────────────
export const listMedia = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const media = await Media.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, data: media });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message },
    });
  }
};

// ─── DELETE /api/v1/media/:id ─────────────────────────────────────────────────
export const deleteMedia = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const media = await Media.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!media) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Media not found" } });
    }
    await cloudinary.uploader.destroy(media.cloudinaryId);
    await media.deleteOne();
    res.json({ success: true, message: "Media deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};
