/**
 * Extracts the primary platform root domain (e.g. "okinsite.com" or "localhost").
 * Strips protocol, port, and leading "www.".
 */
export function getPlatformRootDomain(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_PUBLISHED_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  try {
    const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith("www.")) {
      hostname = hostname.replace(/^www\./, "");
    }
    return hostname || "okinsite.com";
  } catch {
    return "okinsite.com";
  }
}

/** Base URL where the main platform website is hosted (no trailing slash). */
export function getPublishedBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_PUBLISHED_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

/**
 * Builds the canonical public live URL for a published site.
 * Prefers clean custom subdomain: https://${cleanSlug}.okinsite.com
 */
export function buildPublishedSiteUrl(slug?: string): string {
  const cleanSlug = slug?.trim() || "your-slug";
  const rootDomain = getPlatformRootDomain();

  // If running locally, modern browsers resolve *.localhost automatically to 127.0.0.1
  if (rootDomain === "localhost" || rootDomain === "127.0.0.1" || rootDomain.includes("localhost")) {
    return `http://${cleanSlug}.localhost:3000`;
  }

  // Free Vercel preview domains (*.vercel.app) do not support wildcard subdomains
  if (rootDomain.endsWith(".vercel.app")) {
    return `https://${rootDomain}/${cleanSlug}`;
  }

  return `https://${cleanSlug}.${rootDomain}`;
}

/** Suffix label for slug input prefix, e.g. ".okinsite.com" */
export function getPublishedBaseLabel(): string {
  const rootDomain = getPlatformRootDomain();
  return `.${rootDomain}`;
}
