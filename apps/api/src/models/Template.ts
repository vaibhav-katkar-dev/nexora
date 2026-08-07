import { Schema, model, Document } from "mongoose";
import { SiteConfigJSON } from "@ai-platform/shared";

export type TemplateStatus = "draft" | "published" | "archived";

export interface ITemplateDocument extends Document {
  name: string;
  slug: string;
  category: string;
  description?: string;
  thumbnailUrl: string;
  imageUrl?: string;      // cover image URL (no binaries stored)
  previewUrl?: string;    // preview image URL
  tags?: string[];
  defaultConfig: SiteConfigJSON;
  version?: string;
  author?: string;
  isPublic: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  status: TemplateStatus;
  featuredOrder?: number;
  useCount?: number;      // how many projects used this template
  deletedAt?: Date | null; // soft delete marker
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplateDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    category: { type: String, required: true, index: true },
    description: { type: String, trim: true },
    thumbnailUrl: { type: String, required: true },
    imageUrl: { type: String },
    previewUrl: { type: String },
    tags: { type: [String], default: [] },
    defaultConfig: { type: Schema.Types.Mixed, required: true },
    version: { type: String, default: "1.0.0" },
    author: { type: String, default: "Nexora AI" },
    isPublic: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published", index: true },
    featuredOrder: { type: Number, default: 0 },
    useCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

// ─── Optimized indexes for large datasets (10k+ templates) ────────────────
// Unique slug (only enforced for non-soft-deleted rows via partial index)
TemplateSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
// Primary listing & filtering index
TemplateSchema.index({ isPublic: 1, status: 1, featuredOrder: 1 });
// Search-heavy index
TemplateSchema.index({ name: "text", description: "text", tags: "text" });
TemplateSchema.index({ category: 1, status: 1 });
TemplateSchema.index({ isFeatured: 1, status: 1 });
TemplateSchema.index({ createdAt: -1 });

export const Template = model<ITemplateDocument>("Template", TemplateSchema);
