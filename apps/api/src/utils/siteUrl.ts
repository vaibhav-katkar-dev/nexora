/** Base URL where published sites are served (no trailing slash). */
export function getPublishedBaseUrl(): string {
  const raw =
    process.env.PUBLISHED_BASE_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function buildPublishedSiteUrl(slug: string): string {
  return `${getPublishedBaseUrl()}/${slug}`;
}

/** Platform app URL for links back to the editor/dashboard. */
export function getClientBaseUrl(): string {
  const raw = process.env.CLIENT_URL || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
