/** Base URL where published sites are served (no trailing slash). */
export function getPublishedBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_PUBLISHED_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) return appUrl.replace(/\/$/, "");

  return "http://localhost:3000";
}

export function buildPublishedSiteUrl(slug?: string): string {
  const cleanSlug = slug?.trim() || "your-slug";
  return `${getPublishedBaseUrl()}/${cleanSlug}`;
}

/** Host + optional path for slug input prefix, e.g. "localhost:3000" or "mysite.vercel.app". */
export function getPublishedBaseLabel(): string {
  try {
    const { host, pathname } = new URL(getPublishedBaseUrl());
    const path = pathname === "/" ? "" : pathname.replace(/\/$/, "");
    return `${host}${path}`;
  } catch {
    return getPublishedBaseUrl();
  }
}
