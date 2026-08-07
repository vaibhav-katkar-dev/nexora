import { IProjectDocument } from "../models/Project.js";
import { SiteConfigJSON, Section } from "@ai-platform/shared";

// ────────────────────────────────────────────────────────
// SEO HEAD GENERATOR
// Auto-generates all critical SEO, OG, Twitter & Schema tags
// ────────────────────────────────────────────────────────
function buildSeoHead(project: IProjectDocument): string {
  const { seo, config, slug } = project;
  const baseUrl = process.env.PUBLISHED_BASE_URL || "http://localhost:3000/preview";
  const siteUrl = `${baseUrl}/${slug}`;
  const ogImage = seo.ogImage || `${baseUrl}/og-default.png`;

  const schemaType = getSchemaType(config.meta.category);

  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${seo.metaTitle || config.meta.title}</title>
    <meta name="description" content="${seo.metaDescription || config.meta.description}" />
    <link rel="canonical" href="${siteUrl}" />
    ${seo.keywords?.length ? `<meta name="keywords" content="${seo.keywords.join(", ")}" />` : ""}

    <!-- OpenGraph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${siteUrl}" />
    <meta property="og:title" content="${seo.metaTitle || config.meta.title}" />
    <meta property="og:description" content="${seo.metaDescription || config.meta.description}" />
    <meta property="og:image" content="${ogImage}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${siteUrl}" />
    <meta name="twitter:title" content="${seo.metaTitle || config.meta.title}" />
    <meta name="twitter:description" content="${seo.metaDescription || config.meta.description}" />
    <meta name="twitter:image" content="${ogImage}" />

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    ${JSON.stringify(schemaType, null, 2)}
    </script>
  `.trim();
}

function getSchemaType(category: string): object {
  const base = { "@context": "https://schema.org" };
  switch (category) {
    case "portfolio":
    case "resume":
    case "personal":
    case "digital_card":
      return { ...base, "@type": "Person" };
    case "restaurant_menu":
      return { ...base, "@type": "Restaurant" };
    case "event":
      return { ...base, "@type": "Event" };
    case "product_landing":
    case "startup_landing":
      return { ...base, "@type": "Product" };
    case "business":
      return { ...base, "@type": "Organization" };
    default:
      return { ...base, "@type": "WebPage" };
  }
}

// ────────────────────────────────────────────────────────
// SECTION HTML RENDERER
// Converts each section in the JSON config to clean HTML blocks
// ────────────────────────────────────────────────────────
function renderSection(section: Section, theme: SiteConfigJSON["theme"]): string {
  const accent = theme.primaryColor;
  const secondary = theme.secondaryColor;

  switch (section.type) {
    case "hero":
      return `
        <section id="${section.id}" class="hero-section">
          <div class="hero-inner">
            ${section.content?.badge ? `<span class="badge">${section.content.badge}</span>` : ""}
            <h1>${section.title || ""}</h1>
            ${section.subtitle ? `<p class="subtitle">${section.subtitle}</p>` : ""}
            ${section.content?.ctaText
              ? `<a href="${section.content.ctaLink || "#"}" class="cta-btn">${section.content.ctaText}</a>`
              : ""}
          </div>
        </section>`;

    case "about":
      const skills: string[] = section.content?.skills || [];
      return `
        <section id="${section.id}" class="about-section">
          <h2>${section.title || "About"}</h2>
          ${section.subtitle ? `<p>${section.subtitle}</p>` : ""}
          ${skills.length ? `<ul class="skills-list">${skills.map((s) => `<li>${s}</li>`).join("")}</ul>` : ""}
        </section>`;

    case "features":
      const items: any[] = section.content?.items || [];
      return `
        <section id="${section.id}" class="features-section">
          <h2>${section.title || "Features"}</h2>
          ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="features-grid">
            ${items.map((item: any) => `
              <div class="feature-card">
                <h3>${item.title || ""}</h3>
                <p>${item.desc || ""}</p>
              </div>`).join("")}
          </div>
        </section>`;

    case "portfolio_grid":
      const projects: any[] = section.content?.projects || [];
      return `
        <section id="${section.id}" class="portfolio-section">
          <h2>${section.title || "Work"}</h2>
          <div class="portfolio-grid">
            ${projects.map((p: any) => `
              <div class="portfolio-card">
                <h3>${p.name || ""}</h3>
                <p>${p.desc || ""}</p>
                ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
              </div>`).join("")}
          </div>
        </section>`;

    case "menu_list":
      const categories: any[] = section.content?.categories || [];
      return `
        <section id="${section.id}" class="menu-section">
          <h2>${section.title || "Menu"}</h2>
          ${categories.map((cat: any) => `
            <div class="menu-category">
              <h3 class="menu-category-title">${cat.name}</h3>
              <div class="menu-items">
                ${(cat.items || []).map((item: any) => `
                  <div class="menu-item">
                    <div class="menu-item-info">
                      <span class="menu-item-name">${item.name}</span>
                      <span class="menu-item-desc">${item.desc || ""}</span>
                    </div>
                    <span class="menu-item-price">${item.price || ""}</span>
                  </div>`).join("")}
              </div>
            </div>`).join("")}
        </section>`;

    case "links":
      const links: any[] = section.content?.links || [];
      return `
        <section id="${section.id}" class="links-section">
          ${section.title ? `<h2>${section.title}</h2>` : ""}
          <div class="links-list">
            ${links.map((link: any) => `
              <a href="${link.url || "#"}" target="_blank" rel="noopener noreferrer" class="link-btn">
                ${link.label || link.url}
              </a>`).join("")}
          </div>
        </section>`;

    case "digital_card": {
      const socials = section.content?.socials || {};
      const avatar = section.content?.avatar || "";
      return `
        <section id="${section.id}" class="digital-card-section">
          <div class="digital-card">
            ${avatar ? `<img src="${avatar}" alt="${section.title || "Avatar"}" class="dc-avatar" />` : `<div class="dc-avatar-placeholder">${(section.title || "?")[0].toUpperCase()}</div>`}
            <h1 class="dc-name">${section.title || ""}</h1>
            ${section.subtitle ? `<p class="dc-role">${section.subtitle}</p>` : ""}
            ${section.content?.bio ? `<p class="dc-bio">${section.content.bio}</p>` : ""}
            <div class="dc-divider"></div>
            <div class="dc-socials">
              ${socials.email ? `<a href="mailto:${socials.email}" class="dc-social-btn">📧 Email</a>` : ""}
              ${socials.phone ? `<a href="tel:${socials.phone}" class="dc-social-btn">📞 Call</a>` : ""}
              ${socials.linkedin ? `<a href="${socials.linkedin}" target="_blank" rel="noopener" class="dc-social-btn">in LinkedIn</a>` : ""}
              ${socials.github ? `<a href="${socials.github}" target="_blank" rel="noopener" class="dc-social-btn">⌥ GitHub</a>` : ""}
              ${socials.twitter ? `<a href="${socials.twitter}" target="_blank" rel="noopener" class="dc-social-btn">𝕏 Twitter</a>` : ""}
              ${socials.website ? `<a href="${socials.website}" target="_blank" rel="noopener" class="dc-social-btn">🌐 Website</a>` : ""}
            </div>
            ${section.content?.location ? `<p class="dc-location">📍 ${section.content.location}</p>` : ""}
          </div>
        </section>`;
    }

    case "contact":
      const c = section.content || {};
      return `
        <section id="${section.id}" class="contact-section">
          <h2>${section.title || "Contact"}</h2>
          ${section.subtitle ? `<p>${section.subtitle}</p>` : ""}
          <div class="contact-details">
            ${c.email ? `<p>📧 <a href="mailto:${c.email}">${c.email}</a></p>` : ""}
            ${c.phone ? `<p>📞 ${c.phone}</p>` : ""}
            ${c.address ? `<p>📍 ${c.address}</p>` : ""}
            ${c.hours ? `<p>🕐 ${c.hours}</p>` : ""}
            ${c.github ? `<p><a href="${c.github}" target="_blank" rel="noopener">GitHub →</a></p>` : ""}
          </div>
        </section>`;

    default:
      return `<section id="${section.id}"><h2>${section.title || ""}</h2><p>${section.subtitle || ""}</p></section>`;
  }
}

// ────────────────────────────────────────────────────────
// THEME CSS GENERATOR
// Converts SiteTheme config into inline CSS variables
// ────────────────────────────────────────────────────────
function buildThemeCss(theme: SiteConfigJSON["theme"]): string {
  const isGlass = theme.mode === "glassmorphism";
  const isDark = theme.mode === "dark" || isGlass;
  const fontName = theme.fontFamily || theme.headingFont || "Inter";

  return `
    @import url('https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: ${theme.primaryColor};
      --secondary: ${theme.secondaryColor};
      --bg: ${theme.backgroundColor};
      --text: ${theme.textColor};
      --font: '${fontName}', sans-serif;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--font); line-height: 1.6; overflow-x: hidden; }
    a { color: var(--primary); text-decoration: none; }
    a:hover { opacity: 0.8; }
    section { padding: 5rem 2rem; max-width: 1100px; margin: 0 auto; }

    /* Hero */
    .hero-section { min-height: 85vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; }
    .hero-inner { max-width: 760px; }
    .hero-section h1 { font-size: clamp(2.5rem, 6vw, 5rem); font-weight: 800; line-height: 1.1; margin-bottom: 1.25rem; }
    .hero-section .subtitle { font-size: 1.2rem; opacity: 0.7; margin-bottom: 2rem; }
    .badge { display: inline-block; padding: 0.3rem 1rem; border-radius: 999px; border: 1px solid var(--primary); color: var(--primary); font-size: 0.8rem; margin-bottom: 1.5rem; letter-spacing: 0.05em; }
    .cta-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.9rem 2.2rem; background: var(--primary); color: #fff; border-radius: 10px; font-weight: 600; font-size: 1rem; transition: opacity 0.2s; }
    .cta-btn:hover { opacity: 0.85; color: #fff; }

    /* Features */
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
    .feature-card { padding: 1.75rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: ${isGlass ? "rgba(255,255,255,0.05)" : isDark ? "rgba(255,255,255,0.03)" : "#f8f9fa"}; backdrop-filter: ${isGlass ? "blur(12px)" : "none"}; }
    .feature-card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--primary); }

    /* Portfolio */
    .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
    .portfolio-card { padding: 1.75rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); }
    .portfolio-card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
    .tag { display: inline-block; margin-top: 0.75rem; padding: 0.25rem 0.75rem; background: var(--primary); color: #fff; border-radius: 999px; font-size: 0.75rem; }

    /* Menu */
    .menu-category { margin-bottom: 3rem; }
    .menu-category-title { font-size: 1.4rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem; margin-bottom: 1.5rem; }
    .menu-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 1rem; }
    .menu-item-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .menu-item-name { font-weight: 600; font-size: 1rem; }
    .menu-item-desc { font-size: 0.85rem; opacity: 0.6; }
    .menu-item-price { font-weight: 700; color: var(--primary); white-space: nowrap; }

    /* Links */
    .links-section { max-width: 520px; text-align: center; }
    .links-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
    .link-btn { display: block; padding: 1rem 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: ${isGlass ? "rgba(255,255,255,0.07)" : isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}; font-weight: 600; font-size: 1rem; transition: transform 0.15s, background 0.15s; }
    .link-btn:hover { transform: translateY(-2px); background: var(--primary); color: #fff; }

    /* About */
    .about-section h2 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
    .skills-list { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; list-style: none; }
    .skills-list li { padding: 0.35rem 1rem; border-radius: 999px; border: 1px solid var(--primary); font-size: 0.9rem; color: var(--primary); }

    /* Contact */
    .contact-section h2 { font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; }
    .contact-details { display: flex; flex-direction: column; gap: 0.75rem; font-size: 1rem; }

    /* Digital Card */
    .digital-card-section { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 3rem 1.5rem; }
    .digital-card { max-width: 420px; width: 100%; text-align: center; padding: 2.5rem 2rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); background: ${isGlass ? "rgba(255,255,255,0.06)" : isDark ? "rgba(255,255,255,0.04)" : "#ffffff"}; backdrop-filter: ${isGlass ? "blur(20px)" : "none"}; box-shadow: 0 25px 60px rgba(0,0,0,0.4); }
    .dc-avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--primary); object-fit: cover; margin-bottom: 1.25rem; }
    .dc-avatar-placeholder { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 700; color: #fff; margin: 0 auto 1.25rem; }
    .dc-name { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.35rem; }
    .dc-role { font-size: 1rem; color: var(--primary); font-weight: 600; margin-bottom: 0.75rem; opacity: 0.9; }
    .dc-bio { font-size: 0.9rem; opacity: 0.65; line-height: 1.65; margin-bottom: 1.25rem; }
    .dc-divider { width: 48px; height: 2px; background: var(--primary); border-radius: 2px; margin: 1.25rem auto; opacity: 0.6; }
    .dc-socials { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-bottom: 1rem; }
    .dc-social-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.55rem 1.25rem; border-radius: 999px; border: 1px solid rgba(255,255,255,0.15); background: ${isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}; font-size: 0.85rem; font-weight: 600; color: inherit; text-decoration: none; transition: all 0.2s; }
    .dc-social-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); transform: translateY(-2px); opacity: 1; }
    .dc-location { font-size: 0.85rem; opacity: 0.5; margin-top: 0.5rem; }

    /* Section headings */
    section > h2 { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.75rem; }
    .section-subtitle { opacity: 0.65; margin-bottom: 1rem; font-size: 1.05rem; }

    /* Responsive */
    @media (max-width: 640px) {
      .hero-section h1 { font-size: 2.2rem; }
      .features-grid, .portfolio-grid { grid-template-columns: 1fr; }
    }

    /* Sitemap & robots fallback styles */
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }
  `.trim();
}

// ────────────────────────────────────────────────────────
// SITEMAP & ROBOTS GENERATORS
// ────────────────────────────────────────────────────────
export function buildSitemap(slug: string): string {
  const baseUrl = process.env.PUBLISHED_BASE_URL || "https://sites.presence.ai";
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/${slug}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
}

export function buildRobotsTxt(slug: string): string {
  const baseUrl = process.env.PUBLISHED_BASE_URL || "https://sites.presence.ai";
  return `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/${slug}/sitemap.xml`;
}

// ────────────────────────────────────────────────────────
// MAIN STATIC SITE COMPILER
// Converts full project document → production HTML string
// ────────────────────────────────────────────────────────
export async function buildStaticSite(project: IProjectDocument): Promise<{ staticUrl: string; html: string }> {
  const { config, customCode, slug } = project;

  const seoHead = buildSeoHead(project);
  const themeCss = buildThemeCss(config.theme);
  const sectionsHtml = config.sections.map((s) => renderSection(s, config.theme)).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  ${seoHead}
  <style>${themeCss}</style>
  ${customCode?.css ? `<style>${customCode.css}</style>` : ""}
</head>
<body>
  <main>
    ${sectionsHtml}
    ${customCode?.html || ""}
  </main>
  ${customCode?.js ? `<script>${customCode.js}</script>` : ""}
</body>
</html>`;

  // In production: upload HTML to object storage (Cloudinary raw / Vercel Blob / R2)
  // For now: save path represents where the file would be deployed
  const baseUrl = process.env.PUBLISHED_BASE_URL || "http://localhost:3000/preview";
  const staticUrl = `${baseUrl}/${slug}`;

  return { staticUrl, html };
}
