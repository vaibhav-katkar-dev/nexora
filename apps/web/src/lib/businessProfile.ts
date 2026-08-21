import { SiteConfigJSON } from "@ai-platform/shared";

export interface BusinessProfile {
  brandName: string;
  tagline: string;
  category: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  whatsappSameAsPhone: boolean;
  email: string;
  location: string;
  website?: string;
  ctaText?: string;
}

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  brandName: "",
  tagline: "",
  category: "business",
  logoUrl: "",
  phone: "",
  whatsapp: "",
  whatsappSameAsPhone: true,
  email: "",
  location: "",
  website: "",
  ctaText: "Get in Touch",
};

const STORAGE_KEY = "nexora_business_profile_v1";

/**
 * Retrieve saved business profile from localStorage
 */
export function getSavedBusinessProfile(): BusinessProfile {
  if (typeof window === "undefined") {
    return { ...DEFAULT_BUSINESS_PROFILE };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BUSINESS_PROFILE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_BUSINESS_PROFILE,
      ...parsed,
      // If whatsapp is empty or equals phone, keep whatsappSameAsPhone true
      whatsappSameAsPhone:
        parsed.whatsappSameAsPhone !== undefined
          ? Boolean(parsed.whatsappSameAsPhone)
          : !parsed.whatsapp || parsed.whatsapp === parsed.phone,
    };
  } catch (err) {
    console.warn("[businessProfile] Error loading profile from storage:", err);
    return { ...DEFAULT_BUSINESS_PROFILE };
  }
}

/**
 * Save business profile to localStorage
 */
export function saveBusinessProfile(profile: Partial<BusinessProfile>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSavedBusinessProfile();
    const merged = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn("[businessProfile] Error saving profile to storage:", err);
  }
}

/**
 * Deeply injects business profile information into a SiteConfigJSON template/project.
 */
export function injectBusinessProfileIntoConfig(
  config: SiteConfigJSON,
  profile: Partial<BusinessProfile>
): SiteConfigJSON {
  if (!config) return config;

  const patched: SiteConfigJSON = JSON.parse(JSON.stringify(config));

  const brand = (profile.brandName || "").trim();
  const tagline = (profile.tagline || "").trim();
  const phone = (profile.phone || "").trim();
  const whatsapp = (
    profile.whatsappSameAsPhone ? phone : (profile.whatsapp || "").trim()
  ) || phone;
  const email = (profile.email || "").trim();
  const location = (profile.location || "").trim();
  const logoUrl = (profile.logoUrl || "").trim();
  const ctaText = (profile.ctaText || "").trim();

  // 1. Meta / SEO info
  if (brand) {
    patched.meta.title = tagline ? `${brand} — ${tagline}` : brand;
    if (profile.category) {
      patched.meta.category = profile.category as any;
    }
  }
  if (tagline && !patched.meta.description) {
    patched.meta.description = `${brand ? brand + ": " : ""}${tagline}`;
  }

  if (patched.seo) {
    if (brand) patched.seo.metaTitle = patched.meta.title;
    if (tagline) patched.seo.metaDescription = tagline;
    if (logoUrl && !patched.seo.ogImage) patched.seo.ogImage = logoUrl;
  }

  // 2. Traverse and inject into sections
  if (Array.isArray(patched.sections)) {
    patched.sections = patched.sections.map((sec: any) => {
      const s = { ...sec };
      const c = { ...(s.content || {}) };

      // Brand / Business Name replacements
      if (brand) {
        if (typeof c.businessName === "string") c.businessName = brand;
        if (typeof c.companyName === "string") c.companyName = brand;
        if (typeof c.brandName === "string") c.brandName = brand;
        if (typeof c.brand === "string") c.brand = brand;
        if (typeof c.logoText === "string") c.logoText = brand;

        if (s.type === "hero" || s.type === "header" || s.type === "navbar") {
          if (typeof c.title === "string" && c.title.length < 80) c.title = brand;
          if (typeof c.heading === "string" && c.heading.length < 80) c.heading = brand;
          if (typeof s.title === "string" && s.title.length < 80 && s.type !== "hero") s.title = brand;
        }

        if (s.type === "digital_card") {
          if (typeof c.name === "string") c.name = brand;
          if (typeof s.title === "string") s.title = brand;
          if (typeof c.company === "string") c.company = brand;
        }

        if (s.type === "footer") {
          if (typeof c.copyright === "string") {
            c.copyright = `© ${new Date().getFullYear()} ${brand}. All rights reserved.`;
          }
        }
      }

      // Tagline / Subtitle replacements
      if (tagline) {
        if (s.type === "hero" || s.type === "header") {
          if (typeof c.subtitle === "string") c.subtitle = tagline;
          if (typeof c.tagline === "string") c.tagline = tagline;
          if (typeof s.subtitle === "string") s.subtitle = tagline;
        }
        if (s.type === "digital_card") {
          if (typeof c.subtitle === "string") c.subtitle = tagline;
          if (typeof c.role === "string") c.role = tagline;
        }
      }

      // Logo URL replacements
      if (logoUrl) {
        if (typeof c.logoUrl === "string" || s.type === "navbar" || s.type === "header") {
          c.logoUrl = logoUrl;
        }
        if (typeof c.logo === "string") c.logo = logoUrl;
        if (s.type === "digital_card") {
          c.avatarUrl = logoUrl;
          c.logoUrl = logoUrl;
        }
      }

      // Phone replacements
      if (phone) {
        if (typeof c.phone === "string" || s.type === "contact" || s.type === "footer") {
          c.phone = phone;
        }
        if (c.socials && typeof c.socials === "object") {
          c.socials = { ...c.socials, phone };
        }
      }

      // WhatsApp replacements
      if (whatsapp) {
        if (typeof c.whatsapp === "string" || s.type === "contact" || s.type === "whatsapp") {
          c.whatsapp = whatsapp;
        }
        if (typeof c.publicWhatsapp === "string") {
          c.publicWhatsapp = whatsapp;
        }
        if (s.type === "whatsapp") {
          c.phone = whatsapp;
          if (brand && !c.defaultText) {
            c.defaultText = `Hi! I would like to inquire about ${brand}.`;
          }
        }
        if (c.formConfig && typeof c.formConfig === "object") {
          c.formConfig = { ...c.formConfig, whatsappNumber: whatsapp };
        }
        if (c.socials && typeof c.socials === "object") {
          c.socials = { ...c.socials, whatsapp };
        }
      }

      // Email replacements
      if (email) {
        if (typeof c.email === "string" || s.type === "contact" || s.type === "footer") {
          c.email = email;
        }
        if (c.formConfig && typeof c.formConfig === "object") {
          c.formConfig = { ...c.formConfig, notifyEmail: email };
        }
        if (c.socials && typeof c.socials === "object") {
          c.socials = { ...c.socials, email };
        }
      }

      // Location / Address replacements
      if (location) {
        if (typeof c.address === "string" || s.type === "contact" || s.type === "footer" || s.type === "maps") {
          c.address = location;
        }
        if (typeof c.location === "string" || s.type === "digital_card" || s.type === "maps") {
          c.location = location;
        }
        if (s.type === "maps") {
          c.query = location;
        }
      }

      // CTA Text replacements
      if (ctaText && (s.type === "hero" || s.type === "header")) {
        if (typeof c.ctaText === "string") c.ctaText = ctaText;
        if (typeof c.buttonText === "string") c.buttonText = ctaText;
      }

      s.content = c;
      return s;
    });
  }

  return patched;
}
