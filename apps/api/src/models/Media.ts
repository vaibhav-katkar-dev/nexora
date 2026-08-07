import { Schema, model, Document, Types } from "mongoose";

export interface IMediaDocument extends Document {
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  fileName: string;
  cloudinaryId: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}

const MediaSchema = new Schema<IMediaDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    fileName: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Media = model<IMediaDocument>("Media", MediaSchema);
