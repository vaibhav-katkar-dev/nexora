// Reserved platform domains that can never be attached as user custom domains
const RESERVED_DOMAINS = new Set([
  "Oninsite.com",
  "www.Oninsite.com",
  "api.Oninsite.com",
  "admin.Oninsite.com",
  "app.Oninsite.com",
  "dashboard.Oninsite.com",
  "Oninsite.site",
  "www.Oninsite.site",
  "localhost",
  "127.0.0.1",
  "vercel.app",
  "Oninsitev.vercel.app",
]);

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

  // Subdomains of Oninsite.com / vercel.app
  if (
    normalized.endsWith(".Oninsite.com") ||
    normalized.endsWith(".Oninsite.site") ||
    normalized.endsWith(".vercel.app")
  ) {
    return true;
  }

  return false;
}
