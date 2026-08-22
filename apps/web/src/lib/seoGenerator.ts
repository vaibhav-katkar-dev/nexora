import { SiteConfigJSON } from "@ai-platform/shared";
import { buildPublishedSiteUrl } from "./siteUrl";

export interface SeoMetadataOptions {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    keywords?: string[];
    favicon?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
  };
  config?: SiteConfigJSON | null;
  slug?: string;
  projectName?: string;
  robots?: string;
  canonicalUrl?: string;
}

/**
 * Generates structured Schema.org JSON-LD microdata for Google search rich snippets based on site category.
 */
export function generateJsonLdSchema(options: SeoMetadataOptions): Record<string, any> {
  const { config, seo, slug, projectName, canonicalUrl } = options;
  const title = seo?.metaTitle || config?.meta?.title || projectName || "Digital Presence";
  const description = seo?.metaDescription || config?.meta?.description || "Built with Oninsite AI Platform";
  const url = canonicalUrl || (seo?.canonicalUrl) || (slug ? buildPublishedSiteUrl(slug) : typeof window !== "undefined" ? window.location.href : "");
  const category = config?.meta?.category || "custom";

  const baseSchema = {
    "@context": "https://schema.org",
    "@url": url,
    "name": title,
    "description": description,
  };

  switch (category) {
    case "portfolio":
    case "resume":
    case "personal":
      return {
        ...baseSchema,
        "@type": "Person",
        "name": title,
        "description": description,
        "url": url,
      };

    case "business":
    case "agency":
      return {
        ...baseSchema,
        "@type": "Organization",
        "name": title,
        "description": description,
        "url": url,
        "logo": seo?.ogImage || undefined,
      };

    case "restaurant_menu":
      return {
        ...baseSchema,
        "@type": "Restaurant",
        "name": title,
        "description": description,
        "url": url,
        "servesCuisine": "International",
      };

    case "product_landing":
    case "startup_landing":
      return {
        ...baseSchema,
        "@type": "SoftwareApplication",
        "name": title,
        "description": description,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
      };

    default:
      return {
        ...baseSchema,
        "@type": "WebSite",
        "name": title,
        "description": description,
        "url": url,
        "publisher": {
          "@type": "Organization",
          "name": "Oninsite Digital Presence Platform",
        },
      };
  }
}

/**
 * Dynamically updates document <head> with SEO title, meta description, Open Graph, Twitter Cards, Canonical links, Favicon & JSON-LD schema.
 */
export function injectSeoHeadTags(options: SeoMetadataOptions): void {
  if (typeof document === "undefined") return;

  const { config, seo, slug, projectName } = options;

  const title = seo?.metaTitle || config?.meta?.title || projectName || "Digital Presence";
  const description = seo?.metaDescription || config?.meta?.description || "Created with Oninsite Platform";
  const keywords = (seo?.keywords && seo.keywords.length > 0 ? seo.keywords : config?.meta?.tags || []).join(", ");
  const ogImage = seo?.ogImage || (config?.meta as any)?.ogImage || "https://Oninsite.site/og-default.png";
  
  const computedCanonical = options.canonicalUrl || seo?.canonicalUrl || (slug ? buildPublishedSiteUrl(slug) : window.location.href);

  const robotsDirective =
    options.robots ||
    (seo?.noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");

  // 1. Page Title
  document.title = title;

  // Helper function to set or create meta tag
  const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  // 2. Standard SEO Meta Tags
  setMetaTag("meta[name='description']", "name", "description", description);
  if (keywords) setMetaTag("meta[name='keywords']", "name", "keywords", keywords);
  setMetaTag("meta[name='robots']", "name", "robots", robotsDirective);

  // 3. Open Graph Tags
  setMetaTag("meta[property='og:title']", "property", "og:title", title);
  setMetaTag("meta[property='og:description']", "property", "og:description", description);
  setMetaTag("meta[property='og:type']", "property", "og:type", "website");
  setMetaTag("meta[property='og:url']", "property", "og:url", computedCanonical);
  setMetaTag("meta[property='og:site_name']", "property", "og:site_name", "Oninsite Digital Presence");
  if (ogImage) setMetaTag("meta[property='og:image']", "property", "og:image", ogImage);

  // 4. Twitter Card Tags
  setMetaTag("meta[name='twitter:card']", "name", "twitter:card", "summary_large_image");
  setMetaTag("meta[name='twitter:title']", "name", "twitter:title", title);
  setMetaTag("meta[name='twitter:description']", "name", "twitter:description", description);
  if (ogImage) setMetaTag("meta[name='twitter:image']", "name", "twitter:image", ogImage);

  // 5. Canonical Link
  let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", computedCanonical);

  // 6. Favicon Link (if customized)
  if (seo?.favicon) {
    let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.setAttribute("rel", "icon");
      document.head.appendChild(favicon);
    }
    favicon.setAttribute("href", seo.favicon);
  }

  // 7. JSON-LD Schema.org Microdata Script
  const jsonLdData = generateJsonLdSchema({ ...options, canonicalUrl: computedCanonical });
  let jsonLdScript = document.getElementById("Oninsite-jsonld-schema") as HTMLScriptElement | null;
  if (!jsonLdScript) {
    jsonLdScript = document.createElement("script");
    jsonLdScript.id = "Oninsite-jsonld-schema";
    jsonLdScript.type = "application/ld+json";
    document.head.appendChild(jsonLdScript);
  }
  jsonLdScript.textContent = JSON.stringify(jsonLdData);
}
