import { Schema, model, Document, Types } from "mongoose";

export interface IDnsRecord {
  type: string;
  name: string;
  value: string;
  recommended?: boolean;
}

export interface IDomainDocument extends Document {
  domain: string;
  normalizedDomain: string;
  siteId: Types.ObjectId;
  userId: Types.ObjectId;
  status: "pending" | "verifying" | "active" | "failed" | "removed";
  verificationStatus: string;
  isPrimary: boolean;
  vercelDomainId?: string;
  dnsRecords: IDnsRecord[];
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DnsRecordSchema = new Schema<IDnsRecord>(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    value: { type: String, required: true },
    recommended: { type: Boolean, default: true },
  },
  { _id: false }
);

const DomainSchema = new Schema<IDomainDocument>(
  {
    domain: { type: String, required: true, trim: true },
    normalizedDomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    siteId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "verifying", "active", "failed", "removed"],
      default: "pending",
      index: true,
    },
    verificationStatus: { type: String, default: "pending_dns" },
    isPrimary: { type: Boolean, default: false, index: true },
    vercelDomainId: { type: String, default: "" },
    dnsRecords: [DnsRecordSchema],
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index for querying primary domain per site
DomainSchema.index({ siteId: 1, isPrimary: 1 });

export const Domain = model<IDomainDocument>("Domain", DomainSchema);
