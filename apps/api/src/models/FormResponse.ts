import { Schema, model, Document, Types } from "mongoose";

export interface IFormResponseDocument extends Document {
  projectId: Types.ObjectId;
  projectSlug: string;
  projectName: string;
  userId: Types.ObjectId;
  formId?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  customData?: Record<string, any>;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  isRead: boolean;
  isStarred: boolean;
  ipHash?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormResponseSchema = new Schema<IFormResponseDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    projectSlug: { type: String, required: true, index: true },
    projectName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    formId: { type: String, default: "default" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },
    customData: { type: Schema.Types.Mixed, default: {} },
    utm: {
      source: { type: String, default: "" },
      medium: { type: String, default: "" },
      campaign: { type: String, default: "" },
      term: { type: String, default: "" },
      content: { type: String, default: "" },
    },
    isRead: { type: Boolean, default: false, index: true },
    isStarred: { type: Boolean, default: false, index: true },
    ipHash: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    referrer: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound indexes for fast filtering and pagination in user dashboard
FormResponseSchema.index({ userId: 1, createdAt: -1 });
FormResponseSchema.index({ projectId: 1, createdAt: -1 });
FormResponseSchema.index({ userId: 1, isRead: 1 });

export const FormResponse = model<IFormResponseDocument>("FormResponse", FormResponseSchema);
