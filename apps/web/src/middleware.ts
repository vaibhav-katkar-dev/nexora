import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Reserved platform hostnames that should never trigger custom domain rewrites
const RESERVED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "Oninsite.com",
  "www.Oninsite.com",
  "Oninsite.site",
  "www.Oninsite.site",
  "api.Oninsite.com",
  "admin.Oninsite.com",
  "app.Oninsite.com",
  "Oninsitev.vercel.app",
]);

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

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host")?.split(":")[0]?.toLowerCase().trim() || "";

  // If request is for an excluded system route, proceed normally
  if (EXCLUDED_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // If host is a platform host or Vercel preview domain ending in .vercel.app (and not a custom domain)
  if (RESERVED_HOSTS.has(hostname) || hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // Custom Domain Detected!
  // Rewrite request path to `/[slug]` passing the normalized hostname as the slug parameter.
  // The public slug page (`/[slug]/page.tsx`) & backend API will resolve `www.cafemumbai.com` to the published site.
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
