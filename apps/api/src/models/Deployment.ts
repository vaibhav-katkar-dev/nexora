import { Schema, model, Document, Types } from "mongoose";
import { SiteConfigJSON } from "@ai-platform/shared";

export interface IDeploymentDocument extends Document {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  version: number;
  slug: string;
  snapshotConfig: SiteConfigJSON;
  staticUrl: string;
  deploymentStatus: "pending" | "success" | "failed";
  deployedAt: Date;
}

const DeploymentSchema = new Schema<IDeploymentDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    version: { type: Number, required: true },
    slug: { type: String, required: true, index: true },
    snapshotConfig: { type: Schema.Types.Mixed, required: true },
    staticUrl: { type: String, required: true },
    deploymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    deployedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Deployment = model<IDeploymentDocument>("Deployment", DeploymentSchema);
