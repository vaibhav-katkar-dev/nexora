import { Schema, model, Document } from "mongoose";
import { SiteConfigJSON } from "@ai-platform/shared";

export interface ITemplateDocument extends Document {
  name: string;
  category: string;
  thumbnailUrl: string;
  defaultConfig: SiteConfigJSON;
  isPublic: boolean;
  featuredOrder?: number;
  createdAt: Date;
}

const TemplateSchema = new Schema<ITemplateDocument>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    thumbnailUrl: { type: String, required: true },
    defaultConfig: { type: Schema.Types.Mixed, required: true },
    isPublic: { type: Boolean, default: true, index: true },
    featuredOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TemplateSchema.index({ isPublic: 1, featuredOrder: 1 });

export const Template = model<ITemplateDocument>("Template", TemplateSchema);
