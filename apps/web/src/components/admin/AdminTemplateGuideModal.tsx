"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import {
  FileJson,
  X,
  Check,
  Copy,
  Search,
  Sparkles,
  AlertTriangle,
  Layers,
  Palette,
  Code,
  SlidersHorizontal,
  Info,
  BookOpen,
  ChevronRight,
  Terminal,
  Zap,
} from "lucide-react";

const FULL_AI_GUIDE_TEXT = `# NEXORA AI TEMPLATE CREATION & RETENTION SYSTEM SPECIFICATION

You are an AI Template Creator for the Nexora AI Digital Presence platform.
When generating a template configuration, output ONLY a strictly valid SiteConfigJSON object.

---

## 1. CRITICAL SYNTAX & FORMATTING RULES
1. Escaped Line Breaks: In customCode.css and multiline strings, escape line breaks as \\n. NEVER put raw literal line breaks inside a JSON string.
2. No JSON Comments: Comments (// or /* */) are forbidden in JSON.
3. Strict Double Quotes: All keys and string values must be double-quoted ("key": "value").
4. No Trailing Commas: Objects and arrays must NOT end with trailing commas.
5. CSS Scoping: Write selectors with body.tpl-<slug> or bare body prefix. They will be auto-scoped to .nexora-tpl-<slug>.

---

## 2. TOP-LEVEL STRUCTURE SCHEMA
{
  "meta": {
    "id": "my-tpl-slug",
    "slug": "my-tpl-slug",
    "title": "Template Title",
    "category": "portfolio | resume | digital_card | restaurant_menu | business | product_landing | startup_landing | personal | event | link_in_bio | blank",
    "description": "Short summary of template style",
    "author": "Nexora AI",
    "version": "1.0.0",
    "tags": ["modern", "clean"],
    "status": "published"
  },
  "theme": { ... },
  "sections": [ ... ],
  "seo": { "metaTitle": "...", "metaDescription": "..." },
  "customCode": { "html": "", "css": "...", "js": "..." }
}

---

## 3. THEME TOKENS SCHEMA & LUMINANCE DETECTOR
"theme": {
  "mode": "light | dark | glassmorphism",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#8B5CF6",
  "accentColor": "#F59E0B",
  "backgroundColor": "#090D16", // Bright hex like #FBF7EE auto-switches cards & text to light mode
  "textColor": "#F8FAFC",
  "headingFont": "Outfit | Inter | Roboto | Poppins | Playfair Display | Space Grotesk | Plus Jakarta Sans | Cormorant Garamond",
  "bodyFont": "Inter | Roboto | Jost",
  "borderRadius": "12px | 16px | 24px | 9999px",
  "buttonVariant": "rounded | pill | square | gradient",
  "cardVariant": "glass | border | solid",
  "shadow": "none | sm | md | lg | xl",
  "spacingScale": "compact | comfortable | spacious",
  "animations": true
}

---

## 4. VISUAL EDITOR ELEMENT KEY PROTOCOL (data-element-key)
The visual editor matches elements to state using data-element-key:
- Root Section Fields: "title", "subtitle", "badge"
- Content Object Fields: "content.ctaText", "content.ctaLink", "content.avatar", "content.bio"
- Indexed Item Arrays: "content.items.0.title", "content.projects.1.name", "content.customLinks.0.label", "content.socials.email"

---

## 5. ALL 23 SUPPORTED SECTION TYPES & CONTENT SPECIFICATIONS

1. digital_card (Digital Contact & NFC Profile):
   { "id": "card-1", "type": "digital_card", "variant": "vcard", "title": "Marcus Sterling", "subtitle": "Managing Director", "badge": "💳 Digital Card", "content": { "avatar": "https://...", "bio": "...", "location": "San Francisco, CA", "ctaText": "Book Meeting", "ctaLink": "https://cal.com", "socials": { "email": "a@b.com", "phone": "+123456", "linkedin": "https://...", "twitter": "https://..." }, "customLinks": [{ "label": "Portfolio", "url": "https://...", "badge": "New", "icon": "ExternalLink" }] } }

2. hero (Hero Banner & Stats):
   { "id": "hero-1", "type": "hero", "variant": "centered", "title": "...", "subtitle": "...", "badge": "...", "content": { "ctaText": "...", "ctaLink": "#...", "secondaryCtaText": "...", "secondaryCtaLink": "#...", "avatarUrl": "https://...", "stats": [{ "label": "Clients", "value": "500+" }] } }

3. links (Link in Bio Aggregator):
   { "id": "links-1", "type": "links", "title": "@KaiVibes", "subtitle": "Creator", "content": { "links": [{ "label": "🎵 Listen to New Single", "url": "https://...", "badge": "New", "icon": "Globe" }] } }

4. features (Features Grid):
   { "id": "feat-1", "type": "features", "title": "...", "subtitle": "...", "content": { "items": [{ "title": "Fast", "desc": "...", "icon": "Zap" }] } }

5. services (Services Showcase):
   { "id": "serv-1", "type": "services", "title": "...", "subtitle": "...", "content": { "items": [{ "title": "Consulting", "desc": "...", "icon": "Sparkles", "image": "https://...", "price": "$100" }] } }

6. portfolio_grid (Project Portfolio):
   { "id": "port-1", "type": "portfolio_grid", "title": "Selected Works", "content": { "projects": [{ "name": "Project A", "desc": "...", "tag": "Web", "image": "https://...", "url": "https://..." }] } }

7. menu_list (Restaurant Menu):
   { "id": "menu-1", "type": "menu_list", "title": "Menu", "content": { "categories": [{ "name": "Starters", "items": [{ "name": "Bruschetta", "desc": "...", "price": "$18", "badge": "Popular" }] }] } }

8. gallery (Image Showcase):
   { "id": "gal-1", "type": "gallery", "title": "Gallery", "content": { "images": [{ "url": "https://...", "alt": "..." }] } }

9. pricing (Tiered Plans):
   { "id": "price-1", "type": "pricing", "title": "Pricing", "content": { "plans": [{ "name": "Pro", "desc": "...", "price": "$29", "period": "/mo", "isPopular": true, "badge": "Popular", "buttonText": "Get Started", "buttonUrl": "#", "features": ["Feature 1", "Feature 2"] }] } }

10. faq (FAQ Accordion):
    { "id": "faq-1", "type": "faq", "title": "FAQ", "content": { "items": [{ "question": "Q?", "answer": "A." }] } }

11. testimonials (Client Reviews):
    { "id": "test-1", "type": "testimonials", "title": "Testimonials", "content": { "items": [{ "quote": "Great service!", "author": "Jane Doe", "role": "CEO", "avatar": "https://..." }] } }

12. team (Team Members):
    { "id": "team-1", "type": "team", "title": "Meet the Team", "content": { "members": [{ "name": "Alex", "role": "Designer", "avatar": "https://...", "bio": "..." }] } }

13. contact (Contact Details & Socials):
    { "id": "contact-1", "type": "contact", "title": "Contact", "content": { "email": "a@b.com", "phone": "+123456", "address": "1 Main St", "hours": "9am-5pm", "instagram": "https://...", "github": "https://..." } }

14. maps (Google Maps Embed):
    { "id": "map-1", "type": "maps", "title": "Location", "content": { "address": "Springfield", "lat": 37.77, "lng": -122.41, "zoom": 15, "height": 380 } }

15. whatsapp (Direct WhatsApp Chat Button):
    { "id": "wa-1", "type": "whatsapp", "title": "WhatsApp Support", "content": { "phone": "+15551234567", "defaultText": "Hi! I need assistance.", "buttonText": "Chat on WhatsApp", "availability": "Online now" } }

16. timeline (Experience & Milestones):
    { "id": "time-1", "type": "timeline", "title": "Milestones", "content": { "items": [{ "period": "2024", "role": "Lead", "company": "Acme", "desc": "..." }] } }

17. blog (Articles Grid):
    { "id": "blog-1", "type": "blog", "title": "Blog", "content": { "posts": [{ "title": "Article", "desc": "...", "image": "https://...", "url": "https://..." }] } }

18. video / media (Video Embed):
    { "id": "vid-1", "type": "video", "title": "Video Tour", "content": { "embedUrl": "https://youtube.com/embed/...", "coverImage": "https://..." } }

19. navbar (Navigation Bar):
    { "id": "nav-1", "type": "navbar", "content": { "links": [{ "label": "Home", "url": "#" }], "ctaText": "Contact", "ctaLink": "#contact" } }

20. footer (Footer Bar):
    { "id": "foot-1", "type": "footer", "title": "Nexora Inc" }

21. about (About Me & Skills):
    { "id": "about-1", "type": "about", "title": "About Me", "content": { "bio": "...", "avatar": "https://...", "skills": ["React", "Node"] } }

22. cta (Call to Action Banner):
    { "id": "cta-1", "type": "cta", "title": "Ready to Start?", "subtitle": "...", "content": { "ctaText": "Join Now", "ctaLink": "#" } }

23. custom_html (Custom Bespoke HTML Fragment):
    { "id": "html-1", "type": "custom_html", "title": "Custom Block", "content": { "html": "<div className='hero-block'>...</div>" } }

---

## 6. COMPLETE MINIMAL WORKING TEMPLATE BOILERPLATE
{
  "meta": {
    "id": "minimal-demo",
    "slug": "minimal-demo",
    "title": "Minimal Demo",
    "category": "business",
    "description": "Clean, high-performance one-pager.",
    "author": "Nexora AI",
    "version": "1.0.0",
    "tags": ["clean", "business"],
    "status": "published"
  },
  "theme": {
    "mode": "dark",
    "primaryColor": "#3B82F6",
    "secondaryColor": "#8B5CF6",
    "backgroundColor": "#090D16",
    "textColor": "#F8FAFC",
    "headingFont": "Outfit",
    "bodyFont": "Inter",
    "borderRadius": "16px",
    "buttonVariant": "pill",
    "cardVariant": "glass"
  },
  "sections": [
    { "id": "nav-1", "type": "navbar", "content": { "links": [{ "label": "Services", "url": "#services" }], "ctaText": "Contact", "ctaLink": "#contact" } },
    { "id": "hero-1", "type": "hero", "title": "Welcome to Nexora", "subtitle": "AI Digital Presence Platform.", "content": { "ctaText": "Get Started", "ctaLink": "#contact" } },
    { "id": "foot-1", "type": "footer", "title": "Nexora Inc" }
  ],
  "customCode": { "html": "", "css": "body.tpl-minimal-demo h1 { text-shadow: 0 0 20px rgba(59,130,246,0.5); }", "js": "" }
}
`;

interface AdminTemplateGuideModalProps {
  onClose: () => void;
}

export function AdminTemplateGuideModal({ onClose }: AdminTemplateGuideModalProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"rules" | "theme" | "sections" | "bindings" | "css" | "boilerplate">("sections");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySnippet = (key: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("Copied to clipboard", "Snippet is ready to use in your template JSON.");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleCopyFullGuideForAi = () => {
    try {
      navigator.clipboard.writeText(FULL_AI_GUIDE_TEXT.trim());
      setCopiedKey("full_ai_guide");
      toast.success(
        "Copied Full AI Guide Context!",
        "Paste this specification directly into your AI generator prompt."
      );
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ─────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                Template Creation & Visual Editor Retention Guide
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact schema specifications, element binding keys, and theme tokens for Nexora AI &amp; template authors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Entire Guide for AI Context button */}
            <button
              onClick={handleCopyFullGuideForAi}
              className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-600 hover:from-indigo-500 hover:to-sky-500 transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95"
              title="Copy complete guide text for AI system prompt context"
            >
              {copiedKey === "full_ai_guide" ? (
                <Check size={14} className="text-emerald-300" />
              ) : (
                <Sparkles size={14} className="text-amber-300" />
              )}
              <span>{copiedKey === "full_ai_guide" ? "Copied Full AI Spec!" : "Copy Entire Guide for AI"}</span>
            </button>

            {/* Search within guide */}
            <div className="relative w-40 sm:w-56 hidden sm:block">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search guide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
        <div className="px-6 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: "sections", label: "3. Section & Content Specs (23)", icon: Layers },
            { id: "bindings", label: "4. Visual Editor Element Keys", icon: SlidersHorizontal },
            { id: "theme", label: "2. Theme Engine & Luminance", icon: Palette },
            { id: "rules", label: "1. Critical JSON Rules", icon: AlertTriangle },
            { id: "css", label: "5. Custom CSS & Scoping", icon: Code },
            { id: "boilerplate", label: "6. Ready Templates", icon: Sparkles },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                  active
                    ? "bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
                }`}
              >
                <IconComponent size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Tab Body Content ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CRITICAL RULES */}
          {activeTab === "rules" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/40 text-xs text-indigo-200 leading-relaxed flex items-start gap-3">
                <Info size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-indigo-100 font-extrabold text-sm block mb-1">Architecture &amp; Validation Overview</b>
                  A template is a strict <code className="text-sky-300">SiteConfigJSON</code> document. When created via the Admin Panel or generated by AI, it is parsed and validated against the Zod schema before being committed to MongoDB. Adhering to these rules guarantees zero save errors and 100% visual editor compatibility.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={14} /> Critical Syntax &amp; Formatting Rules
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-4 leading-relaxed">
                    <li>
                      <b className="text-white">Escaped Line Breaks:</b> String properties (especially <code className="text-sky-300">customCode.css</code>) must escape newlines as <code className="text-emerald-400 font-mono">\n</code>. Raw literal multiline strings inside JSON throw <code className="text-rose-300">"Bad control character in string literal"</code>.
                    </li>
                    <li>
                      <b className="text-white">No JSON Comments:</b> Standard JSON forbids <code className="text-slate-400">//</code> and <code className="text-slate-400">/* */</code>. Remove all comments.
                    </li>
                    <li>
                      <b className="text-white">Strict Double Quotes:</b> All keys and string values must use double quotes (<code className="text-emerald-400">"key": "value"</code>). Single quotes cause syntax parsing failure.
                    </li>
                    <li>
                      <b className="text-white">No Trailing Commas:</b> Objects and arrays must not end with a trailing comma.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} /> Template Container &amp; Scoping
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-4 leading-relaxed">
                    <li>
                      <b className="text-white">Unique <code className="text-sky-300">meta.slug</code>:</b> Slugs are used as unique identifiers and HTML container classes (<code className="text-sky-300">nexora-tpl-{"<slug>"}</code>).
                    </li>
                    <li>
                      <b className="text-white">CSS Scoping:</b> Write custom CSS using <code className="text-sky-300">body.tpl-{"<slug>"}</code> or bare <code className="text-sky-300">body</code> prefixes. The renderer automatically sanitizes and rewrites selectors to target the container element cleanly.
                    </li>
                    <li>
                      <b className="text-white">Forbidden CSS:</b> Direct <code className="text-rose-300">@import</code>, <code className="text-rose-300">@charset</code>, <code className="text-rose-300">javascript:</code> URLs, and <code className="text-rose-300">expression()</code> rules are blocked for security.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Top Level Structure Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Top-Level JSON Skeleton</h4>
                  <button
                    onClick={() =>
                      copySnippet(
                        "top_level",
                        JSON.stringify(
                          {
                            meta: {
                              id: "sample-tpl",
                              slug: "sample-tpl",
                              title: "Sample Template",
                              category: "portfolio",
                              description: "A clean modern template.",
                              author: "Nexora AI",
                              version: "1.0.0",
                              tags: ["modern", "clean"],
                              popularity: 90,
                              isNew: true,
                              status: "published",
                            },
                            theme: {
                              mode: "dark",
                              primaryColor: "#3B82F6",
                              secondaryColor: "#8B5CF6",
                              accentColor: "#F59E0B",
                              backgroundColor: "#090D16",
                              textColor: "#F8FAFC",
                              headingFont: "Outfit",
                              bodyFont: "Inter",
                              borderRadius: "16px",
                              buttonVariant: "pill",
                              cardVariant: "glass",
                              shadow: "lg",
                              spacingScale: "comfortable",
                              animations: true,
                            },
                            sections: [],
                            customCode: { html: "", css: "", js: "" },
                          },
                          null,
                          2
                        )
                      )
                    }
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold"
                  >
                    {copiedKey === "top_level" ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === "top_level" ? "Copied" : "Copy Skeleton"}
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{`{
  "meta": {
    "id": "sample-tpl",
    "slug": "sample-tpl",
    "title": "Sample Template",
    "category": "portfolio",         // portfolio, resume, digital_card, restaurant_menu, business, product_landing, startup_landing, personal, event, link_in_bio, blank
    "description": "Short description",
    "author": "Nexora AI",
    "version": "1.0.0",
    "tags": ["modern", "clean"],
    "status": "published"
  },
  "theme": { ... },
  "sections": [ ... ],
  "seo": { "metaTitle": "...", "metaDescription": "..." },
  "customCode": { "html": "", "css": "...", "js": "..." }
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: THEME MATRIX */}
          {activeTab === "theme" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-700/40 text-xs text-sky-200 leading-relaxed">
                <b className="text-sky-100 font-extrabold text-sm block mb-1">Theme Tokens &amp; Auto-Luminance Engine</b>
                Nexora's theme system injects CSS variables (<code className="text-emerald-300">--primary</code>, <code className="text-emerald-300">--bg</code>, <code className="text-emerald-300">--text</code>, <code className="text-emerald-300">--surface</code>, <code className="text-emerald-300">--border</code>). When a user or template specifies a custom <code className="text-sky-300">backgroundColor</code> (e.g. cream <code className="text-emerald-300">#FBF7EE</code> or dark <code className="text-emerald-300">#090D16</code>), the renderer automatically calculates luminance and adapts cards, borders, and text contrast dynamically!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                    <Palette size={14} /> Color Tokens
                  </h4>
                  <div className="text-xs text-slate-300 space-y-2 font-mono">
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">primaryColor</span>
                      <span className="text-emerald-400 font-bold">Hex (e.g. "#3B82F6")</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">secondaryColor</span>
                      <span className="text-emerald-400 font-bold">Hex (e.g. "#8B5CF6")</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">accentColor</span>
                      <span className="text-emerald-400 font-bold">Hex (e.g. "#F59E0B")</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">backgroundColor</span>
                      <span className="text-emerald-400 font-bold">Hex / RGB (Auto Luminance)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">textColor</span>
                      <span className="text-emerald-400 font-bold">Hex (Auto Contrast fallback)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                    <SlidersHorizontal size={14} /> Typography &amp; UI Variants
                  </h4>
                  <div className="text-xs text-slate-300 space-y-2 font-mono">
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">mode</span>
                      <span className="text-indigo-300 font-bold">"light" | "dark" | "glassmorphism"</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">headingFont / bodyFont</span>
                      <span className="text-indigo-300 font-bold">Outfit, Inter, Roboto, Poppins...</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">buttonVariant</span>
                      <span className="text-indigo-300 font-bold">"rounded" | "pill" | "square" | "gradient"</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">cardVariant</span>
                      <span className="text-indigo-300 font-bold">"glass" | "border" | "solid"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">borderRadius</span>
                      <span className="text-indigo-300 font-bold">"8px" | "12px" | "16px" | "24px" | "9999px"</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Theme JSON Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Complete Theme Object Spec</h4>
                  <button
                    onClick={() =>
                      copySnippet(
                        "theme_spec",
                        JSON.stringify(
                          {
                            mode: "dark",
                            primaryColor: "#0891B2",
                            secondaryColor: "#06B6D4",
                            accentColor: "#F43F5E",
                            backgroundColor: "#04141A",
                            textColor: "#CFFAFE",
                            headingFont: "Outfit",
                            bodyFont: "Inter",
                            borderRadius: "16px",
                            buttonVariant: "pill",
                            cardVariant: "glass",
                            shadow: "lg",
                            spacingScale: "compact",
                            animations: true,
                          },
                          null,
                          2
                        )
                      )
                    }
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold"
                  >
                    {copiedKey === "theme_spec" ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === "theme_spec" ? "Copied" : "Copy Theme Spec"}
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{`"theme": {
  "mode": "dark",                 // "light" | "dark" | "glassmorphism"
  "primaryColor": "#0891B2",
  "secondaryColor": "#06B6D4",
  "accentColor": "#F43F5E",
  "backgroundColor": "#04141A",   // Auto-detected luminance (light hex automatically adjusts surface/text)
  "textColor": "#CFFAFE",
  "headingFont": "Outfit",        // Outfit, Inter, Roboto, Poppins, Playfair Display, Space Grotesk...
  "bodyFont": "Inter",
  "borderRadius": "16px",         // "8px", "12px", "16px", "24px", "9999px"
  "buttonVariant": "pill",        // "rounded" | "pill" | "square" | "gradient"
  "cardVariant": "glass",         // "glass" | "border" | "solid"
  "shadow": "lg",                 // "none" | "sm" | "md" | "lg" | "xl"
  "spacingScale": "compact",      // "compact" | "comfortable" | "spacious"
  "animations": true
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SECTIONS SPEC */}
          {activeTab === "sections" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/40 text-xs text-indigo-200 leading-relaxed flex items-start gap-3">
                <Layers size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-indigo-100 font-extrabold text-sm block mb-1">Supported Section Types &amp; Content Matrix (23 Types)</b>
                  Every section must have a unique <code className="text-sky-300">id</code> and a valid <code className="text-sky-300">type</code>. Below is the complete content specification for all 23 section renderers supported by <code className="text-sky-300">SiteRenderer</code>.
                </div>
              </div>

              {/* Grid of Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    type: "digital_card",
                    title: "Digital Contact & NFC Card",
                    code: `{
  "id": "contact-card",
  "type": "digital_card",
  "variant": "vcard",
  "title": "Marcus Sterling",
  "subtitle": "Managing Director",
  "badge": "💳 Digital Contact Card",
  "content": {
    "avatar": "https://...",
    "bio": "Investing in early-stage AI...",
    "location": "San Francisco, CA",
    "ctaText": "Book Consultation",
    "ctaLink": "https://cal.com/example",
    "socials": {
      "email": "marcus@example.com",
      "phone": "+1 (415) 890-1234",
      "linkedin": "https://linkedin.com/in/example",
      "twitter": "https://twitter.com/example"
    },
    "customLinks": [
      { "label": "Portfolio", "url": "https://...", "badge": "Featured", "icon": "ExternalLink" }
    ]
  }
}`,
                  },
                  {
                    type: "hero",
                    title: "Hero Section",
                    code: `{
  "id": "hero-section",
  "type": "hero",
  "variant": "centered",
  "title": "Build Digital Presence with AI",
  "subtitle": "Generative website builder for creators and businesses.",
  "badge": "⚡ AI Powered",
  "content": {
    "ctaText": "Get Started",
    "ctaLink": "#pricing",
    "secondaryCtaText": "View Demo",
    "secondaryCtaLink": "#features",
    "avatarUrl": "https://...",
    "stats": [
      { "label": "Active Users", "value": "50k+" },
      { "label": "Rating", "value": "4.9/5" }
    ]
  }
}`,
                  },
                  {
                    type: "links",
                    title: "Link in Bio Hub",
                    code: `{
  "id": "links-hub",
  "type": "links",
  "variant": "buttons",
  "title": "@KaiVibes",
  "subtitle": "Music Producer & Visual Artist",
  "content": {
    "links": [
      { "label": "🎵 Listen to New Single", "url": "https://spotify.com", "badge": "New Release", "icon": "Globe" },
      { "label": "📺 Watch Studio Vlog", "url": "https://youtube.com", "icon": "ExternalLink" }
    ]
  }
}`,
                  },
                  {
                    type: "features",
                    title: "Features Grid",
                    code: `{
  "id": "features-grid",
  "type": "features",
  "title": "Built for High Conversion",
  "subtitle": "Everything you need to showcase your work.",
  "content": {
    "items": [
      { "title": "Instant Hosting", "desc": "SSL included automatically.", "icon": "Zap" },
      { "title": "SEO Optimized", "desc": "Ranks high out of the box.", "icon": "Sparkles" }
    ]
  }
}`,
                  },
                  {
                    type: "pricing",
                    title: "Pricing Plans",
                    code: `{
  "id": "pricing-table",
  "type": "pricing",
  "title": "Simple Pricing",
  "subtitle": "Choose the plan that fits your growth.",
  "content": {
    "plans": [
      {
        "name": "Pro",
        "desc": "For creators and startups",
        "price": "$29",
        "period": "/mo",
        "isPopular": true,
        "badge": "Most Popular",
        "buttonText": "Start Free Trial",
        "buttonUrl": "https://...",
        "features": ["Unlimited Sites", "Custom Domain", "24/7 Support"]
      }
    ]
  }
}`,
                  },
                  {
                    type: "faq",
                    title: "FAQ Accordion",
                    code: `{
  "id": "faq-section",
  "type": "faq",
  "title": "Frequently Asked Questions",
  "subtitle": "Have questions? We have answers.",
  "content": {
    "items": [
      { "question": "Can I use custom domains?", "answer": "Yes! You can connect your domain in 1 click." }
    ]
  }
}`,
                  },
                  {
                    type: "portfolio_grid",
                    title: "Portfolio Grid",
                    code: `{
  "id": "portfolio-grid",
  "type": "portfolio_grid",
  "title": "Selected Works",
  "subtitle": "A showcase of recent client projects.",
  "content": {
    "projects": [
      {
        "name": "Fintech Dashboard",
        "desc": "Real-time crypto & stock analytics platform.",
        "tag": "Web App",
        "image": "https://...",
        "url": "https://..."
      }
    ]
  }
}`,
                  },
                  {
                    type: "whatsapp",
                    title: "WhatsApp Quick Contact",
                    code: `{
  "id": "whatsapp-contact",
  "type": "whatsapp",
  "title": "Need Help Fast?",
  "subtitle": "Chat with our support team on WhatsApp.",
  "content": {
    "phone": "+15551234567",
    "defaultText": "Hi! I would like to know more about your services.",
    "buttonText": "Chat on WhatsApp",
    "availability": "Online now · Typical reply under 5 mins"
  }
}`,
                  },
                  {
                    type: "menu_list",
                    title: "Restaurant Menu",
                    code: `{
  "id": "restaurant-menu",
  "type": "menu_list",
  "title": "Chef Specialities",
  "content": {
    "categories": [
      {
        "name": "Starters",
        "items": [
          { "name": "Truffle Bruschetta", "desc": "Toasted sourdough with wild mushroom truffle oil.", "price": "$18", "badge": "Chef Pick" }
        ]
      }
    ]
  }
}`,
                  },
                  {
                    type: "maps",
                    title: "Google Maps Embed",
                    code: `{
  "id": "location-map",
  "type": "maps",
  "title": "Visit Our Store",
  "content": {
    "address": "742 Evergreen Terrace, Springfield",
    "query": "Springfield",
    "lat": 37.7749,
    "lng": -122.4194,
    "zoom": 15,
    "height": 380
  }
}`,
                  },
                ].map((item) => (
                  <div key={item.type} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase bg-sky-950 text-sky-300 border border-sky-800">
                          {item.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                      </div>
                      <button
                        onClick={() => copySnippet(item.type, item.code)}
                        className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        {copiedKey === item.type ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedKey === item.type ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                      {item.code}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VISUAL EDITOR BINDINGS */}
          {activeTab === "bindings" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/40 text-xs text-emerald-200 leading-relaxed">
                <b className="text-emerald-100 font-extrabold text-sm block mb-1">Visual Editor Inline Selection Protocol (<code className="text-white">data-element-key</code>)</b>
                When users click an element in the Visual Editor canvas preview, `SiteRenderer` uses the <code className="text-white">data-element-key</code> HTML attribute to identify which field to select in the Inspector drawer or trigger inline text editing. If an element key matches this convention, inline editing and custom text color tools automatically work!
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider">Exact Key Resolution Convention</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <p className="font-bold text-slate-200">Root Section Fields</p>
                    <p className="font-mono text-[11px] text-sky-400">title</p>
                    <p className="font-mono text-[11px] text-sky-400">subtitle</p>
                    <p className="font-mono text-[11px] text-sky-400">badge</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <p className="font-bold text-slate-200">Content Object Fields</p>
                    <p className="font-mono text-[11px] text-sky-400">content.ctaText</p>
                    <p className="font-mono text-[11px] text-sky-400">content.bio</p>
                    <p className="font-mono text-[11px] text-sky-400">content.avatar</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <p className="font-bold text-slate-200">Array Indexed Items</p>
                    <p className="font-mono text-[11px] text-sky-400">content.items.0.title</p>
                    <p className="font-mono text-[11px] text-sky-400">content.projects.1.name</p>
                    <p className="font-mono text-[11px] text-sky-400">content.customLinks.2.label</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOM CSS & JS */}
          {activeTab === "css" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200 leading-relaxed">
                <b className="text-amber-100 font-extrabold text-sm block mb-1">Custom CSS Animations &amp; Custom JS Execution</b>
                Templates can include keyframe animations, glowing hover cards, or custom scripts inside <code className="text-white">customCode.css</code> and <code className="text-white">customCode.js</code>. The renderer executes them safely inside the template container.
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Example Single-Line Escaped Custom CSS String</h4>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{`"customCode": {
  "css": "body.tpl-neon-bio { background: #04141A; }\\nbody.tpl-neon-bio .btn-glow { box-shadow: 0 0 15px rgba(6,182,212,0.5); }\\n@keyframes pulseGlow { 0% { opacity: 0.7; } 50% { opacity: 1; } 100% { opacity: 0.7; } }",
  "js": "console.log('Template mounted successfully');"
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: BOILERPLATE TEMPLATES */}
          {activeTab === "boilerplate" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Production-Ready Template JSON Boilerplates</h4>
                <span className="text-xs text-slate-400">1-Click Copy &amp; Paste into Monaco Editor</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300 font-mono">1. Digital Card Pro Template</span>
                    <button
                      onClick={() =>
                        copySnippet(
                          "boilerplate_card",
                          JSON.stringify(
                            {
                              meta: {
                                id: "digital-card-pro-v2",
                                slug: "digital-card-pro-v2",
                                title: "Digital Card Pro",
                                category: "digital_card",
                                description: "NFC digital contact card with quick socials & map links.",
                                author: "Nexora Design Studio",
                                version: "2.0.0",
                                tags: ["Digital Card", "Contact", "NFC"],
                                status: "published",
                              },
                              theme: {
                                mode: "dark",
                                primaryColor: "#EA580C",
                                secondaryColor: "#F97316",
                                accentColor: "#F59E0B",
                                backgroundColor: "#1C0D06",
                                textColor: "#FFEDD5",
                                headingFont: "Outfit",
                                bodyFont: "Inter",
                                borderRadius: "24px",
                                buttonVariant: "pill",
                                cardVariant: "glass",
                                shadow: "xl",
                                spacingScale: "compact",
                                animations: true,
                              },
                              sections: [
                                {
                                  id: "card-main",
                                  type: "digital_card",
                                  variant: "vcard",
                                  title: "Marcus Sterling",
                                  subtitle: "Managing Director",
                                  badge: "💳 Digital Contact Card",
                                  content: {
                                    bio: "Investing in early-stage AI infrastructure and developer tooling.",
                                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                                    location: "San Francisco, CA",
                                    ctaText: "Book Meeting",
                                    ctaLink: "https://cal.com",
                                    socials: {
                                      email: "marcus@sterlingvc.com",
                                      phone: "+1 (415) 890-1234",
                                      linkedin: "https://linkedin.com",
                                      twitter: "https://twitter.com",
                                    },
                                    customLinks: [
                                      { label: "Chat on WhatsApp", url: "https://wa.me/15551234567", badge: "Quick Reply", icon: "ExternalLink" },
                                      { label: "Find Us on Map", url: "#map", badge: "Location", icon: "MapPin" },
                                    ],
                                  },
                                },
                              ],
                            },
                            null,
                            2
                          )
                        )
                      }
                      className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-1.5"
                    >
                      {copiedKey === "boilerplate_card" ? <Check size={13} /> : <Copy size={13} />}
                      {copiedKey === "boilerplate_card" ? "Copied Boilerplate" : "Copy Digital Card Boilerplate"}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56">
                    {JSON.stringify(
                      {
                        meta: { id: "digital-card-pro-v2", slug: "digital-card-pro-v2", title: "Digital Card Pro", category: "digital_card" },
                        theme: { mode: "dark", primaryColor: "#EA580C", backgroundColor: "#1C0D06" },
                        sections: [{ id: "card-main", type: "digital_card", title: "Marcus Sterling" }],
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ─────────────────────────────────────────────────── */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullGuideForAi}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-600 hover:from-indigo-500 hover:to-sky-500 transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
            >
              {copiedKey === "full_ai_guide" ? <Check size={14} className="text-emerald-300" /> : <Sparkles size={14} className="text-amber-300" />}
              <span>{copiedKey === "full_ai_guide" ? "Copied Full AI Specification!" : "Copy Entire Guide for AI Context"}</span>
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Paste directly into ChatGPT / Claude / AI prompts</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
