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
      return { ...base, "@type": "Product" };
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
function buildElementColorCss(sections: Section[]): string {
  let css = "";
  for (const section of sections) {
    const colors = section.elementColors;
    if (!colors || Object.keys(colors).length === 0) continue;
    const safeSection = String(section.id).replace(/["\\]/g, "\\$&");
    for (const [key, color] of Object.entries(colors)) {
      if (!color) continue;
      const keys = Array.from(new Set([
        key,
        key.startsWith("content.") ? key : `content.${key}`,
        key.replace(/^content\./, "")
      ]));
      for (const k of keys) {
        const safeKey = String(k).replace(/["\\]/g, "\\$&");
        css += `[data-section-id="${safeSection}"] [data-element-key="${safeKey}"], #${safeSection} [data-element-key="${safeKey}"], [data-section-id="${safeSection}"][data-element-key="${safeKey}"], #${safeSection}[data-element-key="${safeKey}"] { color: ${color} !important; }\n`;
      }
    }
  }
  return css;
}

function buildElementStyleCss(sections: Section[]): string {
  let css = "";
  for (const section of sections) {
    const styles = section.elementStyles;
    if (!styles || Object.keys(styles).length === 0) continue;
    const safeSection = String(section.id).replace(/["\\]/g, "\\$&");
    for (const [key, valueMap] of Object.entries(styles)) {
      if (!valueMap || typeof valueMap !== "object") continue;
      const declarations = Object.entries(valueMap)
        .filter(([, value]) => typeof value === "string" && value.length > 0)
        .map(([property, value]) => {
          const valStr = String(value).trim();
          const cleanVal = valStr.endsWith("!important") ? valStr : `${valStr} !important`;
          return `${property}: ${cleanVal};`;
        })
        .join(" ");
      if (!declarations) continue;
      const keys = Array.from(new Set([
        key,
        key.startsWith("content.") ? key : `content.${key}`,
        key.replace(/^content\./, "")
      ]));
      for (const k of keys) {
        const safeKey = String(k).replace(/["\\]/g, "\\$&");
        css += `[data-section-id="${safeSection}"] [data-element-key="${safeKey}"], #${safeSection} [data-element-key="${safeKey}"], [data-section-id="${safeSection}"][data-element-key="${safeKey}"], #${safeSection}[data-element-key="${safeKey}"] { ${declarations} }\n`;
      }
    }
  }
  return css;
}

function renderSection(section: Section, theme: SiteConfigJSON["theme"]): string {
  const accent = theme.primaryColor;
  const secondary = theme.secondaryColor;

  switch (section.type) {
    case "navbar":
    case "nav":
    case "header": {
      const content = section.content || {};
      const logoImage = content.logoImage || content.logo || (section as any).logoImage;
      const logoWidth = content.logoWidth || (section as any).logoWidth || 36;
      const links: any[] = content.links || [];
      return `
        <nav id="${section.id}" data-section-id="${section.id}" class="navbar-section">
          <div class="navbar-brand">
            ${logoImage ? `<img src="${logoImage}" alt="${section.title || "Logo"}" data-element-key="content.logoImage" class="navbar-logo" style="width:${typeof logoWidth === "number" ? `${logoWidth}px` : logoWidth}; max-height:56px; object-fit:contain;" />` : ""}
            <span data-element-key="title" class="navbar-title">${section.title || "Brand"}</span>
          </div>
          ${links.length ? `<div class="navbar-links">${links.map((l: any, i: number) => {
            const label = typeof l === "string" ? l : (l?.label || l?.name || `Link ${i + 1}`);
            const url = typeof l === "string" ? "#" : (l?.url || "#");
            return `<a href="${url}" data-element-key="content.links.${i}.label" class="navbar-link">${label}</a>`;
          }).join("")}</div>` : ""}
          ${content.ctaText ? `<a href="${content.ctaLink || "#"}" data-element-key="content.ctaText" class="navbar-cta">${content.ctaText}</a>` : ""}
        </nav>`;
    }

    case "hero":
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="hero-section">
          <div class="hero-inner">
            ${section.content?.badge ? `<span data-element-key="badge" class="badge">${section.content.badge}</span>` : ""}
            <h1 data-element-key="title">${section.title || ""}</h1>
            ${section.subtitle ? `<p data-element-key="subtitle" class="subtitle">${section.subtitle}</p>` : ""}
            ${section.content?.avatarUrl ? `<img src="${section.content.avatarUrl}" alt="${section.title || "Hero"}" data-element-key="content.avatarUrl" class="hero-image" />` : ""}
            ${section.content?.ctaText
              ? `<a href="${section.content.ctaLink || "#"}" data-element-key="content.ctaText" class="cta-btn">${section.content.ctaText}</a>`
              : ""}
          </div>
        </section>`;

    case "about":
      const skills: string[] = section.content?.skills || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="about-section">
          <h2 data-element-key="title">${section.title || "About"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle">${section.subtitle}</p>` : ""}
          ${skills.length ? `<ul data-element-key="content.skills" class="skills-list">${skills.map((s) => `<li>${s}</li>`).join("")}</ul>` : ""}
        </section>`;

    case "features":
      const items: any[] = section.content?.items || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="features-section">
          <h2 data-element-key="title">${section.title || "Features"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="features-grid">
            ${items.map((item: any, i: number) => `
              <div data-element-key="content.items.${i}" class="feature-card">
                <h3 data-element-key="content.items.${i}.title">${item.title || ""}</h3>
                <p data-element-key="content.items.${i}.desc">${item.desc || ""}</p>
              </div>`).join("")}
          </div>
        </section>`;

    case "services":
      const serviceItems: any[] = section.content?.items || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="services-section">
          <h2 data-element-key="title">${section.title || "Services"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="services-grid">
            ${serviceItems.map((item: any, i: number) => `
              <article data-element-key="content.items.${i}" class="service-card">
                ${item.image ? `<img src="${item.image}" alt="${item.title || ""}" data-element-key="content.items.${i}.image" />` : ""}
                <div class="service-card-body">
                  <h3 data-element-key="content.items.${i}.title">${item.title || ""}</h3>
                  <p data-element-key="content.items.${i}.desc">${item.desc || ""}</p>
                </div>
              </article>`).join("")}
          </div>
        </section>`;

    case "gallery":
      const galleryImages: any[] = section.content?.images || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="gallery-section">
          <h2 data-element-key="title">${section.title || "Gallery"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="gallery-grid">
            ${galleryImages.map((img: any, i: number) => `
              <figure data-element-key="content.images.${i}" class="gallery-item">
                <img src="${img.url || ""}" alt="${img.alt || "Gallery image"}" data-element-key="content.images.${i}.url" loading="lazy" />
              </figure>`).join("")}
          </div>
        </section>`;

    case "team":
      const members: any[] = section.content?.members || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="team-section">
          <h2 data-element-key="title">${section.title || "Our Team"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="team-grid">
            ${members.map((m: any, i: number) => `
              <article data-element-key="content.members.${i}" class="team-card">
                ${m.avatar ? `<img src="${m.avatar}" alt="${m.name || ""}" data-element-key="content.members.${i}.avatar" loading="lazy" />` : ""}
                <div class="team-card-body">
                  <h3 data-element-key="content.members.${i}.name">${m.name || ""}</h3>
                  <div data-element-key="content.members.${i}.role" class="team-role">${m.role || ""}</div>
                  ${m.bio ? `<p data-element-key="content.members.${i}.bio">${m.bio}</p>` : ""}
                </div>
              </article>`).join("")}
          </div>
        </section>`;

    case "testimonials":
      const testimonies: any[] = section.content?.items || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="testimonials-section">
          <h2 data-element-key="title">${section.title || "Testimonials"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="testimonials-grid">
            ${testimonies.map((t: any, i: number) => `
              <figure data-element-key="content.items.${i}" class="testimonial-card">
                <blockquote data-element-key="content.items.${i}.quote">“${t.quote || ""}”</blockquote>
                <figcaption>
                  ${t.avatar ? `<img src="${t.avatar}" alt="${t.author || ""}" data-element-key="content.items.${i}.avatar" class="testimonial-avatar" loading="lazy" />` : ""}
                  <div class="testimonial-meta">
                    <div data-element-key="content.items.${i}.author" class="testimonial-author">${t.author || ""}</div>
                    ${t.role ? `<div data-element-key="content.items.${i}.role" class="testimonial-role">${t.role}</div>` : ""}
                  </div>
                </figcaption>
              </figure>`).join("")}
          </div>
        </section>`;

    case "portfolio_grid":
      const projects: any[] = section.content?.projects || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="portfolio-section">
          <h2 data-element-key="title">${section.title || "Work"}</h2>
          <div class="portfolio-grid">
            ${projects.map((p: any, i: number) => `
              <div data-element-key="content.projects.${i}" class="portfolio-card">
                <h3 data-element-key="content.projects.${i}.name">${p.name || ""}</h3>
                <p data-element-key="content.projects.${i}.desc">${p.desc || ""}</p>
                ${p.tag ? `<span data-element-key="content.projects.${i}.tag" class="tag">${p.tag}</span>` : ""}
              </div>`).join("")}
          </div>
        </section>`;

    case "products":
      const productItems: any[] = section.content?.items || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="products-section">
          <h2 data-element-key="title">${section.title || "Products"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="products-grid">
            ${productItems.map((item: any, i: number) => `
              <div data-element-key="content.items.${i}" class="product-card">
                ${item.image ? `<img src="${item.image}" alt="${item.title || ""}" data-element-key="content.items.${i}.image" />` : ""}
                ${item.badge ? `<span data-element-key="content.items.${i}.badge" class="badge">${item.badge}</span>` : ""}
                <div class="product-card-body">
                  <h3 data-element-key="content.items.${i}.title">${item.title || ""}</h3>
                  <p data-element-key="content.items.${i}.desc">${item.desc || ""}</p>
                  <div class="product-card-footer">
                    ${item.price ? `<span data-element-key="content.items.${i}.price" class="product-price">${item.price}</span>` : ""}
                    ${(item.buttonText || item.url) ? `<a href="${item.url || "#"}" data-element-key="content.items.${i}.buttonText" class="cta-btn">${item.buttonText || "Buy Now"}</a>` : ""}
                  </div>
                </div>
              </div>`).join("")}
          </div>
        </section>`;

    case "pricing":
      const plans: any[] = section.content?.plans || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="pricing-section">
          <h2 data-element-key="title">${section.title || "Pricing"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="pricing-grid">
            ${plans.map((p: any, i: number) => `
              <div data-element-key="content.plans.${i}" class="pricing-card ${p.isPopular ? "popular" : ""}">
                ${p.badge ? `<span data-element-key="content.plans.${i}.badge" class="badge">${p.badge}</span>` : ""}
                <h3 data-element-key="content.plans.${i}.name">${p.name || ""}</h3>
                <p data-element-key="content.plans.${i}.desc">${p.desc || ""}</p>
                <div class="price-wrap"><span data-element-key="content.plans.${i}.price" class="price">${p.price || ""}</span></div>
                ${p.features?.length ? `<ul class="plan-features">${p.features.map((f: string, fi: number) => `<li data-element-key="content.plans.${i}.features.${fi}">${f}</li>`).join("")}</ul>` : ""}
                <a href="${p.url || p.ctaLink || "#"}" data-element-key="content.plans.${i}.buttonText" class="cta-btn">${p.buttonText || "Get Started"}</a>
              </div>`).join("")}
          </div>
        </section>`;

    case "timeline":
      const timelineItems: any[] = section.content?.items || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="timeline-section">
          <h2 data-element-key="title">${section.title || "Timeline"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="timeline-list">
            ${timelineItems.map((item: any, i: number) => `
              <div data-element-key="content.items.${i}" class="timeline-item">
                <div data-element-key="content.items.${i}.period" class="timeline-period">${item.period || ""}</div>
                <h3 data-element-key="content.items.${i}.role">${item.role || item.title || ""}</h3>
                <div data-element-key="content.items.${i}.company" class="timeline-company">${item.company || item.institution || ""}</div>
                ${item.desc ? `<p data-element-key="content.items.${i}.desc">${item.desc}</p>` : ""}
              </div>`).join("")}
          </div>
        </section>`;

    case "faq":
      const faqItems: any[] = section.content?.items || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="faq-section">
          <h2 data-element-key="title">${section.title || "Frequently Asked Questions"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="faq-list">
            ${faqItems.map((item: any, i: number) => `
              <details data-element-key="content.items.${i}" class="faq-item">
                <summary data-element-key="content.items.${i}.question">${item.question || ""}</summary>
                <div data-element-key="content.items.${i}.answer" class="faq-answer">${item.answer || ""}</div>
              </details>`).join("")}
          </div>
        </section>`;

    case "blog":
      const blogPosts: any[] = section.content?.posts || section.content?.items || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="blog-section">
          <h2 data-element-key="title">${section.title || "Blog"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="blog-grid">
            ${blogPosts.map((post: any, i: number) => `
              <article data-element-key="content.posts.${i}" class="blog-card">
                ${post.image ? `<img src="${post.image}" alt="${post.title || ""}" data-element-key="content.posts.${i}.image" />` : ""}
                <div class="blog-card-body">
                  <h3 data-element-key="content.posts.${i}.title">${post.title || ""}</h3>
                  <p data-element-key="content.posts.${i}.desc">${post.desc || post.excerpt || ""}</p>
                </div>
              </article>`).join("")}
          </div>
        </section>`;

    case "menu_list":
      const categories: any[] = section.content?.categories || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="menu-section">
          ${section.badge ? `<span data-element-key="badge" class="badge">${section.badge}</span>` : ""}
          <h2 data-element-key="title">${section.title || "Menu"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <div class="menu-categories">
            ${categories.map((cat: any, ci: number) => `
              <div data-element-key="content.categories.${ci}" class="menu-category">
                <h3 data-element-key="content.categories.${ci}.name" class="menu-category-title">${cat.name || ""}</h3>
                <div class="menu-items">
                  ${(cat.items || []).map((item: any, ii: number) => `
                    <div data-element-key="content.categories.${ci}.items.${ii}" class="menu-item">
                      ${item.image ? `<img src="${item.image}" alt="${item.name || ""}" data-element-key="content.categories.${ci}.items.${ii}.image" class="menu-item-img" />` : ""}
                      <div class="menu-item-info">
                        <div class="menu-item-header">
                          <span data-element-key="content.categories.${ci}.items.${ii}.name" class="menu-item-name">${item.name || ""}</span>
                          ${item.badge ? `<span data-element-key="content.categories.${ci}.items.${ii}.badge" class="badge">${item.badge}</span>` : ""}
                        </div>
                        ${item.desc ? `<p data-element-key="content.categories.${ci}.items.${ii}.desc" class="menu-item-desc">${item.desc}</p>` : ""}
                      </div>
                      <div class="menu-item-right">
                        ${item.price ? `<span data-element-key="content.categories.${ci}.items.${ii}.price" class="menu-item-price">${item.price}</span>` : ""}
                        ${(item.buttonText || item.url) ? `<a href="${item.url || "#"}" data-element-key="content.categories.${ci}.items.${ii}.buttonText" class="cta-btn">${item.buttonText || "Order Now"}</a>` : ""}
                      </div>
                    </div>`).join("")}
                </div>
              </div>`).join("")}
          </div>
        </section>`;

    case "footer":
      return `
        <footer id="${section.id}" data-section-id="${section.id}" class="footer-section">
          <p data-element-key="title">© ${new Date().getFullYear()} ${section.title || "Oninsite AI"}. All rights reserved.</p>
        </footer>`;

    case "links":
      const links: any[] = section.content?.links || [];
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="links-section">
          ${section.title ? `<h2 data-element-key="title">${section.title}</h2>` : ""}
          <div class="links-list">
            ${links.map((link: any, i: number) => `
              <a href="${link.url || "#"}" target="_blank" rel="noopener noreferrer" data-element-key="content.links.${i}.label" class="link-btn">
                ${link.label || link.url}
              </a>`).join("")}
          </div>
        </section>`;

    case "digital_card": {
      const socials = section.content?.socials || {};
      const avatar = section.content?.avatar || "";
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="digital-card-section">
          <div class="digital-card">
            ${avatar ? `<img src="${avatar}" alt="${section.title || "Avatar"}" data-element-key="content.avatar" class="dc-avatar" />` : `<div class="dc-avatar-placeholder">${(section.title || "?")[0].toUpperCase()}</div>`}
            <h1 data-element-key="title" class="dc-name">${section.title || ""}</h1>
            ${section.subtitle ? `<p data-element-key="subtitle" class="dc-role">${section.subtitle}</p>` : ""}
            ${section.content?.bio ? `<p data-element-key="content.bio" class="dc-bio">${section.content.bio}</p>` : ""}
            <div class="dc-divider"></div>
            <div class="dc-socials">
              ${socials.email ? `<a href="mailto:${socials.email}" data-element-key="content.socials.email" class="dc-social-btn">📧 Email</a>` : ""}
              ${socials.phone ? `<a href="tel:${socials.phone}" data-element-key="content.socials.phone" class="dc-social-btn">📞 Call</a>` : ""}
              ${socials.linkedin ? `<a href="${socials.linkedin}" target="_blank" rel="noopener" data-element-key="content.socials.linkedin" class="dc-social-btn">in LinkedIn</a>` : ""}
              ${socials.github ? `<a href="${socials.github}" target="_blank" rel="noopener" data-element-key="content.socials.github" class="dc-social-btn">⌥ GitHub</a>` : ""}
              ${socials.twitter ? `<a href="${socials.twitter}" target="_blank" rel="noopener" data-element-key="content.socials.twitter" class="dc-social-btn">𝕏 Twitter</a>` : ""}
              ${socials.website ? `<a href="${socials.website}" target="_blank" rel="noopener" data-element-key="content.socials.website" class="dc-social-btn">🌐 Website</a>` : ""}
            </div>
            ${section.content?.location ? `<p data-element-key="content.location" class="dc-location">📍 ${section.content.location}</p>` : ""}
          </div>
        </section>`;
    }

    case "contact":
      const c = section.content || {};
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="contact-section">
          <h2 data-element-key="title">${section.title || "Contact"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle">${section.subtitle}</p>` : ""}
          <div class="contact-details">
            ${c.email ? `<p data-element-key="content.email">📧 <a href="mailto:${c.email}">${c.email}</a></p>` : ""}
            ${c.phone ? `<p data-element-key="content.phone">📞 ${c.phone}</p>` : ""}
            ${c.address ? `<p data-element-key="content.address">📍 ${c.address}</p>` : ""}
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
        <section id="${section.id}" data-section-id="${section.id}" class="maps-section">
          <h2 data-element-key="title">${section.title || "Location"}</h2>
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          ${section.content?.address ? `<p data-element-key="content.address" class="map-address">📍 ${section.content.address}</p>` : ""}
          ${embedSrc
            ? `<div class="map-frame"><iframe src="${embedSrc}" width="100%" height="${section.content.height || 380}" style="border:0" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div>`
            : `<div class="map-empty">Add an address or coordinates to display the map.</div>`}
        </section>`;

    case "whatsapp":
      const waPhone = (section.content?.phone || "").replace(/[^0-9]/g, "");
      const waLink = `https://wa.me/${waPhone || "15551234567"}?text=${encodeURIComponent(section.content?.defaultText || "Hi! I'd like to know more about your services.")}`;
      return `
        <section id="${section.id}" data-section-id="${section.id}" class="whatsapp-section">
          ${section.title ? `<h2 data-element-key="title">${section.title}</h2>` : ""}
          ${section.subtitle ? `<p data-element-key="subtitle" class="section-subtitle">${section.subtitle}</p>` : ""}
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" data-element-key="content.buttonText" class="whatsapp-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span>${section.content?.buttonText || "Chat on WhatsApp"}</span>
          </a>
          ${section.content?.availability ? `<p data-element-key="content.availability" class="wa-availability">${section.content.availability}</p>` : ""}
        </section>`;

    case "custom_html":
      return `${section.content?.html || ""}`;

    default:
      return `<section id="${section.id}" data-section-id="${section.id}"><h2>${section.title || ""}</h2><p>${section.subtitle || ""}</p></section>`;
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

    /* Navbar */
    .navbar-section { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: rgba(11, 15, 25, 0.75); display: flex; align-items: center; justify-content: space-between; max-width: 100%; margin: 0; }
    .navbar-brand { display: flex; align-items: center; gap: 0.75rem; }
    .navbar-logo { object-fit: contain; border-radius: 4px; }
    .navbar-title { font-weight: 800; font-size: 1.25rem; letter-spacing: -0.025em; color: #ffffff; }
    .navbar-links { display: flex; align-items: center; gap: 1.5rem; font-size: 0.875rem; font-weight: 500; opacity: 0.85; }
    .navbar-link { color: inherit; transition: opacity 0.2s; }
    .navbar-link:hover { opacity: 1; color: var(--primary); }
    .navbar-cta { padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; color: #ffffff; background: var(--primary); transition: transform 0.2s, opacity 0.2s; }
    .navbar-cta:hover { transform: scale(1.03); opacity: 0.95; }

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

    /* Products */
    .products-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
    .product-card { overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: ${isGlass ? "rgba(255,255,255,0.05)" : isDark ? "rgba(255,255,255,0.03)" : "#f8f9fa"}; position: relative; }
    .product-card img { width: 100%; height: 200px; object-fit: cover; }
    .product-card-body { padding: 1.25rem; }
    .product-card-body h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
    .product-card-footer { display: flex; items-center: center; justify-content: space-between; margin-top: 1rem; }
    .product-price { font-weight: 800; font-size: 1.2rem; color: var(--primary); }

    /* Pricing */
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
    .pricing-card { padding: 2rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); background: ${isGlass ? "rgba(255,255,255,0.05)" : isDark ? "rgba(255,255,255,0.03)" : "#f8f9fa"}; position: relative; }
    .pricing-card.popular { border-color: var(--primary); box-shadow: 0 0 25px rgba(59, 130, 246, 0.2); }
    .price-wrap { margin: 1.25rem 0; }
    .price { font-size: 2.5rem; font-weight: 800; color: var(--primary); }
    .plan-features { list-style: none; margin: 1.5rem 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.9rem; opacity: 0.85; }

    /* Timeline */
    .timeline-list { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2.5rem; border-left: 2px solid var(--primary); padding-left: 1.5rem; }
    .timeline-item { position: relative; }
    .timeline-period { font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 0.25rem; }
    .timeline-company { font-size: 0.85rem; opacity: 0.6; margin-bottom: 0.5rem; }

    /* FAQ */
    .faq-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 2.5rem; }
    .faq-item { padding: 1.25rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); background: ${isDark ? "rgba(255,255,255,0.03)" : "#f8f9fa"}; }
    .faq-item summary { font-weight: 700; font-size: 1.05rem; cursor: pointer; }
    .faq-answer { margin-top: 0.75rem; opacity: 0.75; line-height: 1.6; }

    /* Blog */
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
    .blog-card { overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: ${isDark ? "rgba(255,255,255,0.03)" : "#f8f9fa"}; }
    .blog-card img { width: 100%; height: 180px; object-fit: cover; }
    .blog-card-body { padding: 1.25rem; }

    /* Footer */
    .footer-section { padding: 3rem 1.5rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.85rem; opacity: 0.6; }

    /* Section headings */
    section > h2 { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.75rem; }
    .section-subtitle { opacity: 0.65; margin-bottom: 1rem; font-size: 1.05rem; }

    /* Responsive */
    @media (max-width: 640px) {
      .hero-section h1 { font-size: 2.2rem; }
      .features-grid, .portfolio-grid, .products-grid, .pricing-grid, .blog-grid { grid-template-columns: 1fr; }
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
  const elementColorCss = buildElementColorCss(config.sections || []);
  const elementStyleCss = buildElementStyleCss(config.sections || []);
  const sectionsHtml = config.sections.map((s) => renderSection(s, config.theme)).join("\n");

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
