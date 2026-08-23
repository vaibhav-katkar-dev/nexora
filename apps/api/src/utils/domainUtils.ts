// Reserved platform domains that can never be attached as user custom domains
const RESERVED_DOMAINS = new Set([
  "okinsite.com",
  "www.okinsite.com",
  "api.okinsite.com",
  "admin.okinsite.com",
  "app.okinsite.com",
  "dashboard.okinsite.com",
  "okinsite.site",
  "www.okinsite.site",
  "oninsite.com",
  "www.oninsite.com",
  "api.oninsite.com",
  "admin.oninsite.com",
  "app.oninsite.com",
  "dashboard.oninsite.com",
  "oninsite.site",
  "www.oninsite.site",
  "localhost",
  "127.0.0.1",
  "vercel.app",
]);

// Dynamically register environment hostnames
[process.env.CLIENT_URL, process.env.SITE_BASE_URL].filter(Boolean).forEach((url) => {
  try {
    const host = new URL(url!).hostname.toLowerCase();
    if (host) {
      RESERVED_DOMAINS.add(host);
      if (host.startsWith("www.")) RESERVED_DOMAINS.add(host.replace(/^www\./, ""));
      else RESERVED_DOMAINS.add(`www.${host}`);
    }
  } catch {}
});

/**
 * Normalizes a user-input domain string into a clean hostname.
 * e.g., "HTTPS://WWW.CafeMumbai.com/about?test=1" -> "www.cafemumbai.com"
 */
export function normalizeDomain(input: string): string {
  if (!input || typeof input !== "string") return "";
  let clean = input.trim().toLowerCase();

  // Strip protocol
  clean = clean.replace(/^(https?:\/\/)?/i, "");

  // Strip userinfo, path, query, hash, port
  clean = clean.split("/")[0].split("?")[0].split("#")[0].split(":")[0];

  // Strip trailing dots
  clean = clean.replace(/\.$/, "");

  return clean;
}

/**
 * Validates whether a normalized string is a valid FQDN hostname.
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length < 4 || domain.length > 253) return false;

  // Domain regex: must contain at least one dot, valid labels
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

/**
 * Checks if the domain is a platform reserved domain or suffix.
 */
export function isReservedDomain(domain: string): boolean {
  const normalized = normalizeDomain(domain);
  if (!normalized) return true;

  if (RESERVED_DOMAINS.has(normalized)) return true;

  // Subdomains of platform domains
  if (
    normalized.endsWith(".okinsite.com") ||
    normalized.endsWith(".okinsite.site") ||
    normalized.endsWith(".oninsite.com") ||
    normalized.endsWith(".oninsite.site") ||
    normalized.endsWith(".vercel.app")
  ) {
    return true;
  }

  return false;
}
