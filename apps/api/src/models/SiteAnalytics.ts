import { Schema, model, Document, Types } from "mongoose";

export interface ISiteAnalyticsDailyDocument extends Document {
  projectId: Types.ObjectId;
  projectSlug: string;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  views: number;
  uniqueVisitors: number;
  visitorHashes: string[]; // daily unique visitor hash buffer, capped to prevent unbounded doc size
  clicks: number;
  formSubmissions: number;
  totalDurationSeconds: number;
  durationSampleCount: number;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  referrers: Map<string, number>;
  popularActions: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const SiteAnalyticsDailySchema = new Schema<ISiteAnalyticsDailyDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    projectSlug: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true }, // Format: "YYYY-MM-DD"
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    visitorHashes: { type: [String], default: [] },
    clicks: { type: Number, default: 0 },
    formSubmissions: { type: Number, default: 0 },
    totalDurationSeconds: { type: Number, default: 0 },
    durationSampleCount: { type: Number, default: 0 },
    devices: {
      mobile: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
    referrers: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
    popularActions: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
  },
  { timestamps: true }
);

// Compound unique index ensuring 1 document per project per day for O(1) atomic updates
SiteAnalyticsDailySchema.index({ projectId: 1, date: 1 }, { unique: true });
SiteAnalyticsDailySchema.index({ userId: 1, date: -1 });
// Automatic TTL cleanup: Auto-purges raw daily analytics older than 365 days to prevent Atlas storage bloat
SiteAnalyticsDailySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export const SiteAnalyticsDaily = model<ISiteAnalyticsDailyDocument>("SiteAnalyticsDaily", SiteAnalyticsDailySchema);
