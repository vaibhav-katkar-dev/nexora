import { IDnsRecord } from "../models/Domain.js";

const VERCEL_AUTH_TOKEN = process.env.VERCEL_AUTH_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

const API_BASE = "https://api.vercel.com/v9/projects";

function getVercelHeaders() {
  return {
    Authorization: `Bearer ${VERCEL_AUTH_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function getQueryParams(): string {
  if (VERCEL_TEAM_ID) {
    return `?teamId=${encodeURIComponent(VERCEL_TEAM_ID)}`;
  }
  return "";
}

export interface VercelDomainResult {
  success: boolean;
  domainId?: string;
  verified: boolean;
  verificationStatus: string;
  dnsRecords: IDnsRecord[];
  error?: string;
}

export const DEFAULT_DNS_RECORDS: IDnsRecord[] = [
  {
    type: "A",
    name: "@",
    value: "76.76.21.21",
    recommended: true,
  },
  {
    type: "CNAME",
    name: "www",
    value: "cname.vercel-dns.com",
    recommended: true,
  },
];

/**
 * Adds a domain to Vercel project via Vercel REST API v9.
 * If Vercel env vars are omitted (e.g. local dev), simulates success gracefully.
 */
export async function addDomainToVercel(domain: string): Promise<VercelDomainResult> {
  const isProduction = process.env.NODE_ENV === "production";
  if (!VERCEL_AUTH_TOKEN || !VERCEL_PROJECT_ID) {
    if (isProduction) {
      console.error("[VercelDomainService] CRITICAL: VERCEL_AUTH_TOKEN or VERCEL_PROJECT_ID missing in production.");
      return {
        success: false,
        verified: false,
        verificationStatus: "failed",
        dnsRecords: DEFAULT_DNS_RECORDS,
        error: "Vercel integration is not configured on this server.",
      };
    }
    console.warn(
      `[VercelDomainService] [DEV MODE] VERCEL_AUTH_TOKEN or VERCEL_PROJECT_ID missing. Simulating domain addition for "${domain}".`
    );
    return {
      success: true,
      domainId: `sim_${Date.now()}`,
      verified: false,
      verificationStatus: "pending_dns",
      dnsRecords: DEFAULT_DNS_RECORDS,
    };
  }

  try {
    const url = `${API_BASE}/${VERCEL_PROJECT_ID}/domains${getQueryParams()}`;
    const res = await fetch(url, {
      method: "POST",
      headers: getVercelHeaders(),
      body: JSON.stringify({ name: domain }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Domain already added to this project -> treat as successful
      if (data?.error?.code === "domain_already_in_use" || data?.error?.code === "domain_taken") {
        return {
          success: true,
          verified: data?.verified ?? false,
          verificationStatus: data?.verified ? "verified" : "pending_dns",
          dnsRecords: DEFAULT_DNS_RECORDS,
        };
      }
      return {
        success: false,
        verified: false,
        verificationStatus: "failed",
        dnsRecords: DEFAULT_DNS_RECORDS,
        error: data?.error?.message || `Vercel API error (${res.status})`,
      };
    }

    return {
      success: true,
      domainId: data?.id,
      verified: !!data?.verified,
      verificationStatus: data?.verified ? "verified" : "pending_dns",
      dnsRecords: DEFAULT_DNS_RECORDS,
    };
  } catch (err: any) {
    console.error("[VercelDomainService] Error adding domain:", err);
    return {
      success: false,
      verified: false,
      verificationStatus: "failed",
      dnsRecords: DEFAULT_DNS_RECORDS,
      error: err.message || "Failed to communicate with Vercel API",
    };
  }
}

/**
 * Triggers DNS verification for a domain on Vercel.
 */
export async function verifyDomainOnVercel(domain: string): Promise<VercelDomainResult> {
  const isProduction = process.env.NODE_ENV === "production";
  if (!VERCEL_AUTH_TOKEN || !VERCEL_PROJECT_ID) {
    if (isProduction) {
      return {
        success: false,
        verified: false,
        verificationStatus: "failed",
        dnsRecords: DEFAULT_DNS_RECORDS,
        error: "Vercel integration is not configured on this server.",
      };
    }
    console.warn(
      `[VercelDomainService] [DEV MODE] VERCEL_AUTH_TOKEN or VERCEL_PROJECT_ID missing. Simulating domain verification for "${domain}".`
    );
    return {
      success: true,
      verified: true,
      verificationStatus: "verified",
      dnsRecords: DEFAULT_DNS_RECORDS,
    };
  }

  try {
    const url = `${API_BASE}/${VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}/verify${getQueryParams()}`;
    const res = await fetch(url, {
      method: "POST",
      headers: getVercelHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        verified: false,
        verificationStatus: "pending_dns",
        dnsRecords: DEFAULT_DNS_RECORDS,
        error: data?.error?.message || "DNS verification not complete yet. Please check your DNS records.",
      };
    }

    return {
      success: true,
      verified: !!data?.verified,
      verificationStatus: data?.verified ? "verified" : "pending_dns",
      dnsRecords: DEFAULT_DNS_RECORDS,
    };
  } catch (err: any) {
    return {
      success: false,
      verified: false,
      verificationStatus: "failed",
      dnsRecords: DEFAULT_DNS_RECORDS,
      error: err.message || "Verification request failed",
    };
  }
}

/**
 * Removes a custom domain from Vercel.
 */
export async function removeDomainFromVercel(domain: string): Promise<boolean> {
  if (!VERCEL_AUTH_TOKEN || !VERCEL_PROJECT_ID) {
    return true;
  }

  try {
    const url = `${API_BASE}/${VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}${getQueryParams()}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: getVercelHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error("[VercelDomainService] Failed to remove domain from Vercel:", err);
    return false;
  }
}
