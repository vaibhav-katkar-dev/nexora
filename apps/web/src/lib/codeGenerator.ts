import { Section, SiteTheme } from "@ai-platform/shared";

/**
 * Converts template JSON sections into clean, semantic HTML code.
 * Allows users to view and edit the exact HTML markup of their active template sections.
 */
export function generateHtmlFromSections(sections: Section[]): string {
  if (!sections || sections.length === 0) {
    return `<!-- No sections found. Add sections in the Sections panel! -->`;
  }

  const htmlBlocks: string[] = [
    `<!-- ═════════════════════════════════════════════════════════════════ -->`,
    `<!-- Template HTML Markup — Converted from visual sections          -->`,
    `<!-- Edit this code directly; it renders seamlessly on your site!   -->`,
    `<!-- ═════════════════════════════════════════════════════════════════ -->\n`,
  ];

  sections.forEach((sec) => {
    if (sec.visible === false) return;

    const id = sec.id || sec.type;
    const title = sec.title || "";
    const subtitle = sec.subtitle || "";
    const badge = sec.badge || "";
    const c = sec.content || {};

    switch (sec.type) {
      case "navbar": {
        const links: any[] = c.links || [];
        const linksHtml = links
          .map((l) => `      <a href="${l.url || "#"}" class="nav-link">${l.label || "Link"}</a>`)
          .join("\n");
        htmlBlocks.push(
          `<nav id="${id}" class="site-navbar">\n` +
          `  <div class="nav-brand">${title || "Brand"}</div>\n` +
          `  <div class="nav-links">\n${linksHtml || "      <!-- Nav links -->"}\n  </div>\n` +
          (c.ctaText ? `  <a href="${c.ctaLink || "#"}" class="btn-primary">${c.ctaText}</a>\n` : "") +
          `</nav>`
        );
        break;
      }

      case "hero": {
        const stats: any[] = c.stats || [];
        const statsHtml = stats
          .map(
            (st) =>
              `    <div class="stat-item">\n` +
              `      <div class="stat-value">${st.value || "0"}</div>\n` +
              `      <div class="stat-label">${st.label || ""}</div>\n` +
              `    </div>`
          )
          .join("\n");

        htmlBlocks.push(
          `<section id="${id}" class="hero-section">\n` +
          (badge ? `  <span class="badge">${badge}</span>\n` : "") +
          `  <h1 class="hero-title">${title}</h1>\n` +
          (subtitle ? `  <p class="hero-subtitle">${subtitle}</p>\n` : "") +
          `  <div class="hero-actions">\n` +
          (c.ctaText ? `    <a href="${c.ctaLink || "#"}" class="btn-primary">${c.ctaText}</a>\n` : "") +
          (c.secondaryCtaText ? `    <a href="${c.secondaryCtaLink || "#"}" class="btn-secondary">${c.secondaryCtaText}</a>\n` : "") +
          `  </div>\n` +
          (stats.length > 0 ? `  <div class="hero-stats">\n${statsHtml}\n  </div>\n` : "") +
          `</section>`
        );
        break;
      }

      case "about": {
        const skills: string[] = c.skills || [];
        const highlights: string[] = c.highlights || [];
        const highlightsHtml = highlights.map((h) => `    <li><span class="icon">✓</span> ${h}</li>`).join("\n");
        const skillsHtml = skills.map((s) => `      <span class="skill-tag">${s}</span>`).join("\n");

        htmlBlocks.push(
          `<section id="${id}" class="about-section">\n` +
          `  <div class="about-content">\n` +
          `    <span class="section-tag">About Me</span>\n` +
          `    <h2>${title}</h2>\n` +
          (c.bio ? `    <p class="bio">${c.bio}</p>\n` : "") +
          (highlights.length > 0 ? `    <ul class="highlights-list">\n${highlightsHtml}\n    </ul>\n` : "") +
          `  </div>\n` +
          (skills.length > 0
            ? `  <div class="skills-card">\n` +
              `    <h3>Skills & Expertise</h3>\n` +
              `    <div class="skills-grid">\n${skillsHtml}\n    </div>\n` +
              `  </div>\n`
            : "") +
          `</section>`
        );
        break;
      }

      case "features": {
        const items: any[] = c.items || [];
        const itemsHtml = items
          .map(
            (item) =>
              `    <div class="feature-card">\n` +
              `      <div class="feature-icon">${item.icon || "✨"}</div>\n` +
              `      <h3>${item.title || "Feature"}</h3>\n` +
              `      <p>${item.desc || ""}</p>\n` +
              `    </div>`
          )
          .join("\n");

        htmlBlocks.push(
          `<section id="${id}" class="features-section">\n` +
          `  <div class="section-header">\n` +
          `    <h2>${title}</h2>\n` +
          (subtitle ? `    <p>${subtitle}</p>\n` : "") +
          `  </div>\n` +
          `  <div class="features-grid">\n${itemsHtml}\n  </div>\n` +
          `</section>`
        );
        break;
      }

      case "portfolio_grid": {
        const projects: any[] = c.projects || [];
        const projectsHtml = projects
          .map(
            (p) =>
              `    <div class="project-card">\n` +
              (p.image ? `      <img src="${p.image}" alt="${p.name}" class="project-img"/>\n` : "") +
              `      <div class="project-body">\n` +
              (p.tag ? `        <span class="project-tag">${p.tag}</span>\n` : "") +
              `        <h3>${p.name || "Project"}</h3>\n` +
              (p.desc ? `        <p>${p.desc}</p>\n` : "") +
              (p.url ? `        <a href="${p.url}" target="_blank" class="project-link">View Project &rarr;</a>\n` : "") +
              `      </div>\n` +
              `    </div>`
          )
          .join("\n");

        htmlBlocks.push(
          `<section id="${id}" class="portfolio-section">\n` +
          `  <div class="section-header">\n` +
          `    <h2>${title}</h2>\n` +
          (subtitle ? `    <p>${subtitle}</p>\n` : "") +
          `  </div>\n` +
          `  <div class="portfolio-grid">\n${projectsHtml}\n  </div>\n` +
          `</section>`
        );
        break;
      }

      case "menu_list": {
        const categories: any[] = c.categories || [];
        const catHtml = categories
          .map((cat) => {
            const itemRows = (cat.items || [])
              .map(
                (item: any) =>
                  `      <div class="menu-item">\n` +
                  `        <div class="item-details">\n` +
                  `          <h4>${item.name}${item.badge ? ` <span class="badge">${item.badge}</span>` : ""}</h4>\n` +
                  (item.desc ? `          <p>${item.desc}</p>\n` : "") +
                  `        </div>\n` +
                  `        <span class="price">${item.price || ""}</span>\n` +
                  `      </div>`
              )
              .join("\n");
            return (
              `    <div class="menu-category">\n` +
              `      <h3>${cat.name}</h3>\n` +
              `      <div class="menu-items">\n${itemRows}\n      </div>\n` +
              `    </div>`
            );
          })
          .join("\n");

        htmlBlocks.push(
          `<section id="${id}" class="menu-section">\n` +
          `  <h2>${title}</h2>\n` +
          (subtitle ? `  <p>${subtitle}</p>\n` : "") +
          `  <div class="menu-categories">\n${catHtml}\n  </div>\n` +
          `</section>`
        );
        break;
      }

      case "timeline": {
        const items: any[] = c.items || [];
        const itemsHtml = items
          .map(
            (item) =>
              `    <div class="timeline-item">\n` +
              `      <div class="timeline-date">${item.period || ""}</div>\n` +
              `      <h3>${item.role || item.title || ""}</h3>\n` +
              `      <div class="timeline-org">${item.company || item.institution || ""}</div>\n` +
              (item.desc ? `      <p>${item.desc}</p>\n` : "") +
              `    </div>`
          )
          .join("\n");

        htmlBlocks.push(
          `<section id="${id}" class="timeline-section">\n` +
          `  <h2>${title}</h2>\n` +
          (subtitle ? `  <p>${subtitle}</p>\n` : "") +
          `  <div class="timeline-list">\n${itemsHtml}\n  </div>\n` +
          `</section>`
        );
        break;
      }

      case "pricing": {
        const plans: any[] = c.plans || [];
        const plansHtml = plans
          .map((p) => {
            const featList = (p.features || []).map((f: string) => `        <li>✓ ${f}</li>`).join("\n");
            return (
              `    <div class="pricing-card${p.isPopular ? " popular" : ""}">\n` +
              (p.badge ? `      <span class="badge">${p.badge}</span>\n` : "") +
              `      <h3>${p.name || "Plan"}</h3>\n` +
              (p.desc ? `      <p class="desc">${p.desc}</p>\n` : "") +
              `      <div class="price">${p.price || "$0"}<span>/mo</span></div>\n` +
              `      <ul class="features">\n${featList}\n      </ul>\n` +
              `      <button class="btn-primary">Get Started</button>\n` +
              `    </div>`
            );
          })
          .join("\n");

        htmlBlocks.push(
          `<section id="${id}" class="pricing-section">\n` +
          `  <h2>${title}</h2>\n` +
          (subtitle ? `  <p>${subtitle}</p>\n` : "") +
          `  <div class="pricing-grid">\n${plansHtml}\n  </div>\n` +
          `</section>`
        );
        break;
      }

      case "faq": {
        const items: any[] = c.items || [];
        const itemsHtml = items
          .map(
            (item) =>
              `    <details class="faq-item">\n` +
              `      <summary>${item.question}</summary>\n` +
              `      <p>${item.answer}</p>\n` +
              `    </details>`
          )
          .join("\n");

        htmlBlocks.push(
          `<section id="${id}" class="faq-section">\n` +
          `  <h2>${title}</h2>\n` +
          `  <div class="faq-accordion">\n${itemsHtml}\n  </div>\n` +
          `</section>`
        );
        break;
      }

      case "digital_card": {
        const socials = c.socials || {};
        const avatar = c.avatar || "";

        htmlBlocks.push(
          `<section id="${id}" class="digital-card-section">\n` +
          `  <div class="vcard-container">\n` +
          (avatar ? `    <img src="${avatar}" alt="${title}" class="vcard-avatar"/>\n` : "") +
          `    <h1>${title}</h1>\n` +
          (subtitle ? `    <p class="vcard-title">${subtitle}</p>\n` : "") +
          (c.bio ? `    <p class="vcard-bio">${c.bio}</p>\n` : "") +
          (c.location ? `    <div class="vcard-location">📍 ${c.location}</div>\n` : "") +
          `    <div class="vcard-socials">\n` +
          (socials.email ? `      <a href="mailto:${socials.email}" class="social-btn">Email</a>\n` : "") +
          (socials.phone ? `      <a href="tel:${socials.phone}" class="social-btn">Call</a>\n` : "") +
          (socials.linkedin ? `      <a href="${socials.linkedin}" target="_blank" class="social-btn">LinkedIn</a>\n` : "") +
          (socials.twitter ? `      <a href="${socials.twitter}" target="_blank" class="social-btn">Twitter</a>\n` : "") +
          `    </div>\n` +
          `  </div>\n` +
          `</section>`
        );
        break;
      }

      case "links": {
        const links: any[] = c.links || [];
        const linksHtml = links
          .map(
            (l) =>
              `    <a href="${l.url || "#"}" target="_blank" class="link-btn">\n` +
              (l.badge ? `      <span class="badge">${l.badge}</span>\n` : "") +
              `      <span>${l.label || "Link"}</span>\n` +
              `    </a>`
          )
          .join("\n");

        htmlBlocks.push(
          `<section id="${id}" class="links-section">\n` +
          (title ? `  <h2>${title}</h2>\n` : "") +
          (subtitle ? `  <p>${subtitle}</p>\n` : "") +
          `  <div class="links-grid">\n${linksHtml}\n  </div>\n` +
          `</section>`
        );
        break;
      }

      case "contact": {
        htmlBlocks.push(
          `<section id="${id}" class="contact-section">\n` +
          `  <h2>${title}</h2>\n` +
          (subtitle ? `  <p>${subtitle}</p>\n` : "") +
          `  <div class="contact-container">\n` +
          `    <div class="contact-info">\n` +
          (c.email ? `      <p><strong>Email:</strong> ${c.email}</p>\n` : "") +
          (c.phone ? `      <p><strong>Phone:</strong> ${c.phone}</p>\n` : "") +
          (c.address ? `      <p><strong>Address:</strong> ${c.address}</p>\n` : "") +
          `    </div>\n` +
          `    <form class="contact-form" onsubmit="event.preventDefault(); alert('Message sent!');">\n` +
          `      <input type="text" placeholder="Your Name" required/>\n` +
          `      <input type="email" placeholder="Your Email" required/>\n` +
          `      <textarea placeholder="Your Message..." rows="4"></textarea>\n` +
          `      <button type="submit" class="btn-primary">Send Message</button>\n` +
          `    </form>\n` +
          `  </div>\n` +
          `</section>`
        );
        break;
      }

      case "maps": {
        const embedSrc =
          c.embedUrl ||
          (c.lat || c.lng
            ? `https://maps.google.com/maps?q=${c.lat},${c.lng}&z=${c.zoom || 15}&output=embed`
            : c.address || c.query
            ? `https://maps.google.com/maps?q=${encodeURIComponent(c.address || c.query)}&z=${c.zoom || 15}&output=embed`
            : "");
        htmlBlocks.push(
          `<section id="${id}" class="maps-section">\n` +
          `  <h2>${title}</h2>\n` +
          (subtitle ? `  <p class="section-subtitle">${subtitle}</p>\n` : "") +
          (c.address ? `  <p class="map-address">📍 ${c.address}</p>\n` : "") +
          (embedSrc
            ? `  <div class="map-frame"><iframe src="${embedSrc}" width="100%" height="${c.height || 380}" style="border:0" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div>\n`
            : `  <div class="map-empty">Add an address or coordinates to display the map.</div>\n`) +
          `</section>`
        );
        break;
      }

      case "whatsapp": {
        const phone = (c.phone || "").replace(/[^0-9]/g, "");
        const waLink = `https://wa.me/${phone || "15551234567"}?text=${encodeURIComponent(c.defaultText || "Hi! I'd like to know more about your services.")}`;
        htmlBlocks.push(
          `<section id="${id}" class="whatsapp-section">\n` +
          (title ? `  <h2>${title}</h2>\n` : "") +
          (subtitle ? `  <p class="section-subtitle">${subtitle}</p>\n` : "") +
          `  <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="whatsapp-btn">\n` +
          `    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>\n` +
          `    <span>${c.buttonText || "Chat on WhatsApp"}</span>\n` +
          `  </a>\n` +
          (c.availability ? `  <p class="wa-availability">${c.availability}</p>\n` : "") +
          `</section>`
        );
        break;
      }

      case "footer": {
        htmlBlocks.push(
          `<footer id="${id}" class="site-footer">\n` +
          `  <p>&copy; ${new Date().getFullYear()} ${title || "Nexora AI"}. All rights reserved.</p>\n` +
          `</footer>`
        );
        break;
      }

      default: {
        htmlBlocks.push(
          `<section id="${id}" class="custom-section">\n` +
          `  <h2>${title}</h2>\n` +
          (subtitle ? `  <p>${subtitle}</p>\n` : "") +
          `</section>`
        );
        break;
      }
    }
  });

  return htmlBlocks.join("\n\n");
}

/**
 * Generates CSS rules & variables customized to the active template theme.
 */
export function generateThemeCss(theme: SiteTheme): string {
  const isDark = theme.mode === "dark" || theme.mode === "glassmorphism";

  return [
    `/* ═══ Nexora Template CSS Engine ════════════════════════════════ */`,
    `/* Auto-generated matching your visual template theme settings    */`,
    ``,
    `:root {`,
    `  --primary:         ${theme.primaryColor || "#3B82F6"};`,
    `  --secondary:       ${theme.secondaryColor || "#8B5CF6"};`,
    `  --accent:          ${theme.accentColor || "#F59E0B"};`,
    `  --bg:              ${theme.backgroundColor || (isDark ? "#090D16" : "#F8FAFC")};`,
    `  --text:            ${theme.textColor || (isDark ? "#F8FAFC" : "#0F172A")};`,
    `  --radius:          ${theme.borderRadius || "12px"};`,
    `  --font-heading:    '${theme.headingFont || "Inter"}', sans-serif;`,
    `  --font-body:       '${theme.bodyFont || "Inter"}', sans-serif;`,
    `}`,
    ``,
    `/* ═══ Custom Layout & Element Enhancements ═════════════════════ */`,
    `.site-navbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; }`,
    `.btn-primary { background: var(--primary); color: #fff; padding: 0.75rem 1.5rem; border-radius: var(--radius); text-decoration: none; border: none; font-weight: 600; cursor: pointer; transition: transform 0.2s, opacity 0.2s; }`,
    `.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }`,
    `.btn-secondary { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: var(--text); padding: 0.75rem 1.5rem; border-radius: var(--radius); text-decoration: none; font-weight: 600; }`,
    `.feature-card, .project-card, .pricing-card { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius); padding: 1.5rem; }`,
    `.badge { background: rgba(59, 130, 246, 0.15); color: var(--primary); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }`,
    ``,
  ].join("\n");
}

/**
 * Generates interactive JavaScript tailored to active template sections.
 */
export function generateInteractiveJs(sections: Section[]): string {
  const hasFaq = sections.some((s) => s.type === "faq");
  const hasContact = sections.some((s) => s.type === "contact");
  const hasNavbar = sections.some((s) => s.type === "navbar");

  return [
    `/* ═══ Nexora Interactive JS Snippet ═══════════════════════════ */`,
    `/* Auto-tailored to your template sections                       */`,
    ``,
    `document.addEventListener('DOMContentLoaded', () => {`,
    `  console.log('⚡ Nexora Site Script initialized!');`,
    ``,
    `  // 1. Smooth Scroll for all nav links`,
    `  document.querySelectorAll('a[href^="#"]').forEach(anchor => {`,
    `    anchor.addEventListener('click', function (e) {`,
    `      const target = document.querySelector(this.getAttribute('href'));`,
    `      if (target) {`,
    `        e.preventDefault();`,
    `        target.scrollIntoView({ behavior: 'smooth' });`,
    `      }`,
    `    });`,
    `  });`,
    ``,
    hasNavbar
      ? `  // 2. Sticky Navbar glass effect on scroll\n` +
        `  const nav = document.querySelector('.site-navbar');\n` +
        `  if (nav) {\n` +
        `    window.addEventListener('scroll', () => {\n` +
        `      if (window.scrollY > 40) {\n` +
        `        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';\n` +
        `      } else {\n` +
        `        nav.style.boxShadow = 'none';\n` +
        `      }\n` +
        `    });\n` +
        `  }\n`
      : "",
    hasFaq
      ? `  // 3. FAQ Accordion smooth toggle\n` +
        `  document.querySelectorAll('.faq-item summary').forEach(summary => {\n` +
        `    summary.addEventListener('click', (e) => {\n` +
        `      console.log('FAQ item toggled:', summary.textContent.trim());\n` +
        `    });\n` +
        `  });\n`
      : "",
    hasContact
      ? `  // 4. Contact Form Validation Handler\n` +
        `  const form = document.querySelector('.contact-form');\n` +
        `  if (form) {\n` +
        `    form.addEventListener('submit', (e) => {\n` +
        `      e.preventDefault();\n` +
        `      alert('Thank you! Your message has been sent successfully.');\n` +
        `    });\n` +
        `  }\n`
      : "",
    `});`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Smart Full HTML Document Parser & Splitter
 * Detects if a user pasted a single-file HTML document (with embedded <style> and <script> tags),
 * and cleanly extracts:
 *  - Internal <style> content -> CSS tab
 *  - Internal <script> content -> JS tab
 *  - Body HTML markup -> HTML tab
 */
export interface ParsedHtmlResult {
  html: string;
  css: string;
  js: string;
  isFullDocument: boolean;
  extractedStyleCount: number;
  extractedScriptCount: number;
}

export function parseFullHtmlDocument(rawHtml: string): ParsedHtmlResult {
  if (!rawHtml || typeof rawHtml !== "string") {
    return { html: "", css: "", js: "", isFullDocument: false, extractedStyleCount: 0, extractedScriptCount: 0 };
  }

  const str = rawHtml.trim();

  // Quick check if this contains full document tags or embedded styles/scripts
  const isFullDocument =
    /<!doctype html>/i.test(str) ||
    /<html/i.test(str) ||
    /<head/i.test(str) ||
    /<body/i.test(str) ||
    /<style[\s>]/i.test(str) ||
    /<script[\s>]/i.test(str);

  if (!isFullDocument) {
    return {
      html: rawHtml,
      css: "",
      js: "",
      isFullDocument: false,
      extractedStyleCount: 0,
      extractedScriptCount: 0,
    };
  }

  const extractedStyles: string[] = [];
  const extractedScripts: string[] = [];

  // Extract <style>...</style> content
  const cssCleaned = str.replace(/<style[\s\S]*?>([\s\S]*?)<\/style>/gi, (_, cssContent) => {
    if (cssContent && cssContent.trim()) {
      extractedStyles.push(cssContent.trim());
    }
    return "";
  });

  // Extract <script>...</script> content (excluding src external scripts)
  const jsCleaned = cssCleaned.replace(/<script(?![^>]*\bsrc=)[\s\S]*?>([\s\S]*?)<\/script>/gi, (_, jsContent) => {
    if (jsContent && jsContent.trim()) {
      extractedScripts.push(jsContent.trim());
    }
    return "";
  });

  // Extract body content if <body>...</body> exists
  let bodyContent = jsCleaned;
  const bodyMatch = jsCleaned.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    bodyContent = bodyMatch[1].trim();
  } else {
    // Strip head/html tags if present
    bodyContent = jsCleaned
      .replace(/<!doctype html>/gi, "")
      .replace(/<html[\s\S]*?>/gi, "")
      .replace(/<\/html>/gi, "")
      .replace(/<head[\s\S]*?>[\s\S]*?<\/head>/gi, "")
      .replace(/<body[\s\S]*?>/gi, "")
      .replace(/<\/body>/gi, "")
      .trim();
  }

  return {
    html: bodyContent,
    css: extractedStyles.join("\n\n"),
    js: extractedScripts.join("\n\n"),
    isFullDocument: true,
    extractedStyleCount: extractedStyles.length,
    extractedScriptCount: extractedScripts.length,
  };
}
