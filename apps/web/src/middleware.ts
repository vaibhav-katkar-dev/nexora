import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Reserved platform hostnames that should never trigger custom domain rewrites
const RESERVED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
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
]);

// Dynamically register hostname from NEXT_PUBLIC_SITE_URL if configured
if (process.env.NEXT_PUBLIC_SITE_URL) {
  try {
    const parsedUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL);
    const envHost = parsedUrl.hostname.toLowerCase();
    if (envHost) {
      RESERVED_HOSTS.add(envHost);
      if (envHost.startsWith("www.")) {
        RESERVED_HOSTS.add(envHost.replace(/^www\./, ""));
      } else {
        RESERVED_HOSTS.add(`www.${envHost}`);
      }
    }
  } catch {
    // Ignore invalid URL
  }
}

// Excluded URL pathname prefixes that must bypass custom domain rewriting
const EXCLUDED_PATH_PREFIXES = [
  "/_next",
  "/api",
  "/admin",
  "/dashboard",
  "/editor",
  "/settings",
  "/login",
  "/register",
  "/templates",
  "/sitemap.xml",
  "/sitemaps",
  "/robots.txt",
  "/favicon.ico",
  "/assets",
];

// Reserved subdomains that belong to system infrastructure, not user projects
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "dashboard",
  "custom",
  "sites",
  "mail",
  "smtp",
  "ftp",
  "cname",
  "status",
  "docs",
  "help",
  "support",
  "dev",
  "staging",
  "preview",
  "assets",
  "static",
]);

// Known platform root domain suffixes
const PLATFORM_ROOT_DOMAINS = ["okinsite.com", "okinsite.site", "oninsite.com", "oninsite.site"];

if (process.env.NEXT_PUBLIC_SITE_URL) {
  try {
    const envHost = new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname.toLowerCase().replace(/^www\./, "");
    if (envHost && !PLATFORM_ROOT_DOMAINS.includes(envHost)) {
      PLATFORM_ROOT_DOMAINS.push(envHost);
    }
  } catch {}
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host")?.split(":")[0]?.toLowerCase().trim() || "";

  // If request is for an excluded system route, proceed normally
  if (EXCLUDED_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 1. Check if host is an exact reserved platform host or Vercel preview domain
  if (RESERVED_HOSTS.has(hostname) || hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // 2. Check if host is a platform subdomain (e.g. "cafemumbai.okinsite.com" or "cafemumbai.localhost")
  let detectedSubdomain: string | null = null;

  for (const rootDomain of PLATFORM_ROOT_DOMAINS) {
    if (hostname.endsWith(`.${rootDomain}`)) {
      const sub = hostname.slice(0, -(rootDomain.length + 1));
      // Only single-level subdomains (not multi-level like a.b.okinsite.com)
      if (sub && !sub.includes(".")) {
        detectedSubdomain = sub;
        break;
      }
    }
  }

  // Also support localhost subdomains for local development (e.g. "cafemumbai.localhost")
  if (!detectedSubdomain && (hostname.endsWith(".localhost") || hostname.endsWith(".127.0.0.1"))) {
    const parts = hostname.split(".");
    if (parts.length >= 2 && parts[0]) {
      detectedSubdomain = parts[0];
    }
  }

  if (detectedSubdomain) {
    // If it's a reserved system subdomain (e.g. api.okinsite.com, app.okinsite.com), do not treat as user site
    if (RESERVED_SUBDOMAINS.has(detectedSubdomain)) {
      return NextResponse.next();
    }

    // Rewrite request path to `/[slug]` with the extracted subdomain as slug parameter
    url.pathname = `/${detectedSubdomain}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 3. External Custom Domain Detected (e.g. "www.cafemumbai.com" or "cafemumbai.com")
  // Rewrite request path to `/[slug]` passing the full normalized hostname as slug
  url.pathname = `/${hostname}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files (_next/static, images, favicon).
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
