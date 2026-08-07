import { Schema, model, Document } from "mongoose";
import { SiteConfigJSON } from "@ai-platform/shared";

export interface IPromptCacheDocument extends Document {
  promptHash: string;
  category: string;
  generatedConfig: SiteConfigJSON;
  createdAt: Date;
}

const PromptCacheSchema = new Schema<IPromptCacheDocument>(
  {
    promptHash: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true },
    generatedConfig: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now, expires: 2592000 }, // 30 days TTL index
  }
);

export const PromptCache = model<IPromptCacheDocument>("PromptCache", PromptCacheSchema);
