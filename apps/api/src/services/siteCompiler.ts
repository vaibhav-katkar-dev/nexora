import { IProjectDocument } from "../models/Project.js";
import {
  SiteConfigJSON,
  Section,
  sanitizeTemplateCss,
  resolveTemplateContainerClass,
} from "@ai-platform/shared";
import { getPublishedBaseUrl } from "../utils/siteUrl.js";

// ────────────────────────────────────────────────────────
// SEO HEAD GENERATOR
// Auto-generates all critical SEO, OG, Twitter & Schema tags
// ────────────────────────────────────────────────────────
function buildSeoHead(project: IProjectDocument): string {
  const { seo, config, slug } = project;
  const baseUrl = getPublishedBaseUrl();
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
            ${section.content?.avatarUrl ? `<img src="${section.content.avatarUrl}" alt="${section.title || "Hero"}" class="hero-image" />` : ""}
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

case "services":
      const serviceItems: any[] = section.content?.items || [];
      return `
        <section id="${section.id}" class="services-section">
          <h2>${section.title || "Services"}</h2>
          ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="services-grid">
            ${serviceItems.map((item: any) => `
              <article class="service-card">
                ${item.image ? `<img src="${item.image}" alt="${item.title || ""}" />` : ""}
                <div class="service-card-body">
                  <h3>${item.title || ""}</h3>
                  <p>${item.desc || ""}</p>
                </div>
              </article>`).join("")}
          </div>
        </section>`;

    case "gallery":
      const galleryImages: any[] = section.content?.images || [];
      return `
        <section id="${section.id}" class="gallery-section">
          <h2>${section.title || "Gallery"}</h2>
          ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="gallery-grid">
            ${galleryImages.map((img: any) => `
              <figure class="gallery-item">
                <img src="${img.url || ""}" alt="${img.alt || "Gallery image"}" loading="lazy" />
              </figure>`).join("")}
          </div>
        </section>`;

    case "team":
      const members: any[] = section.content?.members || [];
      return `
        <section id="${section.id}" class="team-section">
          <h2>${section.title || "Our Team"}</h2>
          ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="team-grid">
            ${members.map((m: any) => `
              <article class="team-card">
                ${m.avatar ? `<img src="${m.avatar}" alt="${m.name || ""}" loading="lazy" />` : ""}
                <div class="team-card-body">
                  <h3>${m.name || ""}</h3>
                  <div class="team-role">${m.role || ""}</div>
                  ${m.bio ? `<p>${m.bio}</p>` : ""}
                </div>
              </article>`).join("")}
          </div>
        </section>`;

    case "testimonials":
      const testimonies: any[] = section.content?.items || [];
      return `
        <section id="${section.id}" class="testimonials-section">
          <h2>${section.title || "Testimonials"}</h2>
          ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="testimonials-grid">
            ${testimonies.map((t: any) => `
              <figure class="testimonial-card">
                <blockquote>“${t.quote || ""}”</blockquote>
                <figcaption>
                  ${t.avatar ? `<img src="${t.avatar}" alt="${t.author || ""}" class="testimonial-avatar" loading="lazy" />` : ""}
                  <div class="testimonial-meta">
                    <div class="testimonial-author">${t.author || ""}</div>
                    ${t.role ? `<div class="testimonial-role">${t.role}</div>` : ""}
                  </div>
                </figcaption>
              </figure>`).join("")}
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

    case "maps":
      const embedSrc =
        section.content?.embedUrl ||
        (section.content?.lat || section.content?.lng
          ? `https://maps.google.com/maps?q=${section.content.lat},${section.content.lng}&z=${section.content.zoom || 15}&output=embed`
          : section.content?.address || section.content?.query
          ? `https://maps.google.com/maps?q=${encodeURIComponent(section.content.address || section.content.query)}&z=${section.content.zoom || 15}&output=embed`
          : "");
      return `
        <section id="${section.id}" class="maps-section">
          <h2>${section.title || "Location"}</h2>
          ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ""}
          ${section.content?.address ? `<p class="map-address">📍 ${section.content.address}</p>` : ""}
          ${embedSrc
            ? `<div class="map-frame"><iframe src="${embedSrc}" width="100%" height="${section.content.height || 380}" style="border:0" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div>`
            : `<div class="map-empty">Add an address or coordinates to display the map.</div>`}
        </section>`;

    case "whatsapp":
      const waPhone = (section.content?.phone || "").replace(/[^0-9]/g, "");
      const waLink = `https://wa.me/${waPhone || "15551234567"}?text=${encodeURIComponent(section.content?.defaultText || "Hi! I'd like to know more about your services.")}`;
      return `
        <section id="${section.id}" class="whatsapp-section">
          ${section.title ? `<h2>${section.title}</h2>` : ""}
          ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ""}
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="whatsapp-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span>${section.content?.buttonText || "Chat on WhatsApp"}</span>
          </a>
          ${section.content?.availability ? `<p class="wa-availability">${section.content.availability}</p>` : ""}
        </section>`;

case "custom_html":
      // Render the raw HTML directly so templates that ship full-structure
      // markup (own <section>/<nav>/<footer> roots) keep their layout intact.
      return `${section.content?.html || ""}`;

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

    /* Hero image */
    .hero-image { width: 100%; max-width: 720px; height: 380px; object-fit: cover; border-radius: 18px; margin: 1.5rem auto 2rem; box-shadow: 0 25px 60px rgba(0,0,0,0.4); }

    /* Services */
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
    .service-card { overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: ${isGlass ? "rgba(255,255,255,0.05)" : isDark ? "rgba(255,255,255,0.03)" : "#f8f9fa"}; backdrop-filter: ${isGlass ? "blur(12px)" : "none"}; transition: transform 0.3s, box-shadow 0.3s; }
    .service-card:hover { transform: translateY(-6px); box-shadow: 0 20px 45px rgba(0,0,0,0.25); }
    .service-card img { width: 100%; height: 180px; object-fit: cover; }
    .service-card-body { padding: 1.5rem; }
    .service-card-body h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--primary); }

    /* Gallery */
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 2.5rem; }
    .gallery-item { margin: 0; overflow: hidden; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); }
    .gallery-item img { width: 100%; height: 220px; object-fit: cover; display: block; transition: transform 0.4s; }
    .gallery-item:hover img { transform: scale(1.06); }

    /* Team */
    .team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
    .team-card { overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: ${isGlass ? "rgba(255,255,255,0.05)" : isDark ? "rgba(255,255,255,0.03)" : "#f8f9fa"}; text-align: center; transition: transform 0.3s, box-shadow 0.3s; }
    .team-card:hover { transform: translateY(-6px); box-shadow: 0 20px 45px rgba(0,0,0,0.25); }
    .team-card img { width: 100%; aspect-ratio: 1/1; object-fit: cover; }
    .team-card-body { padding: 1.25rem; }
    .team-card-body h3 { font-size: 1.05rem; font-weight: 700; }
    .team-role { color: var(--primary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin: 0.35rem 0 0.5rem; }
    .team-card-body p { font-size: 0.85rem; opacity: 0.7; }

    /* Testimonials */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
    .testimonial-card { padding: 1.75rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: ${isGlass ? "rgba(255,255,255,0.05)" : isDark ? "rgba(255,255,255,0.03)" : "#f8f9fa"}; }
    .testimonial-card blockquote { margin: 0 0 1.25rem; font-size: 0.95rem; font-style: italic; opacity: 0.85; line-height: 1.6; }
    .testimonial-card figcaption { display: flex; align-items: center; gap: 0.75rem; }
    .testimonial-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary); }
    .testimonial-author { font-weight: 700; font-size: 0.9rem; }
    .testimonial-role { font-size: 0.8rem; opacity: 0.6; }

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
  const baseUrl = getPublishedBaseUrl();
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
  const baseUrl = getPublishedBaseUrl();
  return `User-agent: *
Allow: /
Sitemap: ${baseUrl}/${slug}/sitemap.xml`;
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


// Scoped template customCss escape hatch (sanitized + scoped to the container).
  // Also scope customCode.css (uploaded templates store their animated CSS there)
  // so its "body.tpl-<slug>" selectors are rewritten to the container class.
  const containerClass = resolveTemplateContainerClass(config);
  const containerSelector = `.${containerClass}`;
  const scopedTemplateCss = sanitizeTemplateCss(
[config.customCss, config.customCode?.css, customCode?.css].filter(Boolean).join("\n"),
    containerSelector
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  ${seoHead}
  <style>${themeCss}</style>
  ${scopedTemplateCss ? `<style>${scopedTemplateCss}</style>` : ""}
</head>
<body>
  <main class="${containerClass}">
    ${sectionsHtml}
    ${customCode?.html || ""}
  </main>
  ${customCode?.js ? `<script>${customCode.js}</script>` : ""}
</body>
</html>`;

  // In production: upload HTML to object storage (Cloudinary raw / Vercel Blob / R2)
  // For now: save path represents where the file would be deployed
  const baseUrl = getPublishedBaseUrl();
  const staticUrl = `${baseUrl}/${slug}`;

  return { staticUrl, html };
}
