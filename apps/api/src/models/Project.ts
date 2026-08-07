import { Schema, model, Document, Types } from "mongoose";
import { SiteConfigJSON } from "@ai-platform/shared";

export interface IProjectDocument extends Document {
  userId: Types.ObjectId;
  name: string;
  slug: string;
  category: string;
  config: SiteConfigJSON;
  customCode: {
    html?: string;
    css?: string;
    js?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage?: string;
    keywords?: string[];
  };
  status: "draft" | "published";
  publishedAt?: Date;
  publishedHtml?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    category: { type: String, required: true, index: true },
    config: { type: Schema.Types.Mixed, required: true },
    customCode: {
      html: { type: String, default: "" },
      css: { type: String, default: "" },
      js: { type: String, default: "" },
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      ogImage: { type: String, default: "" },
      keywords: [{ type: String }],
    },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date },
    publishedHtml: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Project = model<IProjectDocument>("Project", ProjectSchema);
