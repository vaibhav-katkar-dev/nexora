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
  Bot,
  Send,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  Smartphone,
  Globe,
  Star,
  CheckCircle2,
} from "lucide-react";

export const UNIVERSAL_AI_MASTER_PROMPT = `# OKINSITE UNIVERSAL AI TEMPLATE GENERATOR MASTER SPECIFICATION

You are an expert Frontend Architect & Visual Template Creator for OkInSite (AI Digital Presence Platform).
Your goal is to generate 100% valid, production-ready, high-converting, visually stunning templates formatted as strict SiteConfigJSON.

OUTPUT FORMAT:
Output ONLY a raw, strictly valid JSON object. No Markdown fences (\`\`\`json). No conversational explanation. Output MUST parse cleanly with JSON.parse().

====================================================================
1. CRITICAL SYNTAX & COMPATIBILITY RULES
====================================================================
1. STRICT DOUBLE QUOTES: All keys and string values must be double-quoted ("key": "value"). No single quotes.
2. NO TRAILING COMMAS: Never leave trailing commas in objects or arrays.
3. NO JSON COMMENTS: Standard JSON forbids // and /* */ comments.
4. ESCAPED NEWLINES: In customCode.css and multiline strings, escape line breaks as \\n.
5. CLEAN SCOPING: Write custom CSS selectors with body.tpl-<slug>. The renderer auto-scopes them to the container.

====================================================================
2. ATTRIBUTE BREAKDOWN (WHAT EVERY KEY DOES)
====================================================================

• "meta" (Identity & Catalog):
  - "id" (String, required): Unique lowercase hyphenated string (e.g. "noir-bio-premium", "luxe-dining").
  - "slug" (String, required): URL slug for template preview and new site creation.
  - "title" (String, required): Human-readable title shown on template cards.
  - "description" (String, required): 1-2 sentence compelling summary of aesthetics, use case, and vibe.
  - "category" (String, required): One of: "portfolio" | "resume" | "digital_card" | "restaurant_menu" | "business" | "product_landing" | "startup_landing" | "personal" | "event" | "link_in_bio" | "blank".
  - "author" (String): Creator name or "OkInSite AI".
  - "version" (String): Semantic version (e.g. "1.0.0").
  - "tags" (Array of Strings): 3-6 searchable keywords (e.g. ["Premium", "Dark", "Animated", "Glassmorphism"]).
  - "popularity" (Number): Integer (85 to 99) for gallery ranking.
  - "isNew" (Boolean): true to display "NEW" badge.
  - "status" (String): "published" | "draft".

• "theme" (Global Styling Tokens):
  - "mode" (String): "dark" | "light" | "glassmorphism".
  - "primaryColor" (Hex String): Main brand color (CTAs, highlights, badges).
  - "secondaryColor" (Hex String): Secondary accent for gradients, borders, badges.
  - "accentColor" (Hex String): Tertiary highlight for icons, star ratings, accents.
  - "backgroundColor" (Hex String): Page background. Deep hex (#0A0A12) triggers dark mode; light hex (#F8FAFC) auto-switches components to light mode.
  - "textColor" (Hex String): Main readable body text color (#F5F3FF or #0F172A).
  - "headingFont" (String): Any Google Font name! E.g.: "Outfit", "Space Grotesk", "Inter", "Syne", "Playfair Display", "Cabinet Grotesk", "Cinzel", "Bricolage Grotesque".
  - "bodyFont" (String): Google Font name: "Inter", "DM Sans", "Plus Jakarta Sans", "Roboto", "Jost".
  - "borderRadius" (String): "8px" | "12px" | "16px" | "24px" | "9999px".
  - "buttonVariant" (String): "pill" | "rounded" | "square" | "gradient".
  - "cardVariant" (String): "glass" | "border" | "solid".
  - "shadow" (String): "none" | "sm" | "md" | "lg" | "xl".
  - "spacingScale" (String): "compact" | "comfortable" | "spacious".
  - "animations" (Boolean): true (enables smooth hover lifts, button glows, and transitions).

• "sections" (Array of Sections):
  - "id" (String, required): Unique section string (e.g. "hero-1", "features-1").
  - "type" (String, required): One of 24 supported section types (see list below).
  - "title" (String, optional): Section heading (bound to visual editor click-to-edit).
  - "subtitle" (String, optional): Sub-heading or supporting description (bound to click-to-edit).
  - "badge" (String, optional): Optional pill badge above heading (e.g. "✨ EXCLUSIVE DROP").
  - "visible" (Boolean): true.
  - "content" (Object, required): Type-specific data object containing text, images, and item arrays.

====================================================================
3. HOW THE VISUAL EDITOR BINDS EACH ELEMENT (CLICK-TO-EDIT)
====================================================================
The OkInSite Visual Editor allows users to click elements on the canvas to edit them immediately:
- "title", "subtitle", "badge": Clicking on the canvas auto-scrolls to and flashes the text field in the Inspector.
- "avatar", "avatarUrl", "image", "imageUrl", "bgImage": Clicking any image on the canvas automatically opens the Image Picker & Uploader Modal!
- "links": Link arrays support URL, Label, Badge, Icon, and WhatsApp chat links.
- "stats": Value and Label pairs editable in the inspector.
- "gallery": Image grid where every frame can be replaced with 1 click.

====================================================================
4. BESPOKE TEMPLATES VIA "custom_template"
====================================================================
For luxury, heavily styled single-section or bespoke pages (like Noir Bio Premium):
Set "type": "custom_template", with:
"content": {
  "templateId": "noir-premium",
  "data": {
    "profile": { "name": "...", "role": "...", "bio": "...", "avatar": "https://..." },
    "badge": "✨ Available for Collabs",
    "stats": [{ "value": "318K", "label": "Followers" }],
    "links": [{ "label": "...", "url": "https://...", "badge": "NEW", "icon": "✦", "featured": true }],
    "gallery": [{ "url": "https://...", "alt": "..." }],
    "socials": { "instagram": "...", "twitter": "...", "youtube": "...", "linkedin": "..." },
    "footerText": "© 2026 Name"
  }
}
This enables bespoke animations (orbs, spinning gradient avatar rings) while making every title, avatar, link, and photo 100% click-to-edit!

====================================================================
5. ALL 24 SUPPORTED NATIVE SECTION TYPES & CONTENT SCHEMAS
====================================================================
1. navbar: {"links": [{"label": "About", "url": "#about"}], "ctaText": "Book", "ctaLink": "#contact"}
2. hero: {"ctaText": "Get Started", "ctaLink": "#", "avatarUrl": "https://...", "stats": [{"label": "Clients", "value": "500+"}]}
3. digital_card: {"avatar": "https://...", "bio": "...", "location": "NYC", "socials": {"email": "...", "phone": "...", "linkedin": "..."}, "customLinks": [{"label": "...", "url": "..."}]}
4. links: {"links": [{"label": "...", "url": "https://...", "badge": "Featured", "icon": "Globe"}]}
5. features: {"items": [{"title": "Fast", "desc": "...", "icon": "Zap"}]}
6. services: {"items": [{"title": "Consulting", "desc": "...", "price": "$150", "image": "https://..."}]}
7. portfolio_grid: {"projects": [{"name": "App", "desc": "...", "tag": "Design", "image": "https://...", "url": "https://..."}]}
8. menu_list: {"categories": [{"name": "Entrees", "items": [{"name": "Steak", "desc": "...", "price": "$38", "badge": "Signature"}]}]}
9. gallery: {"images": [{"url": "https://...", "alt": "..."}]}
10. pricing: {"plans": [{"name": "Pro", "price": "$49", "period": "/mo", "isPopular": true, "features": ["Feature 1", "Feature 2"]}]}
11. faq: {"items": [{"question": "...", "answer": "..."}]}
12. testimonials: {"items": [{"quote": "...", "author": "...", "role": "...", "avatar": "https://..."}]}
13. team: {"members": [{"name": "...", "role": "...", "avatar": "https://...", "bio": "..."}]}
14. contact: {"email": "...", "phone": "...", "address": "...", "hours": "...", "instagram": "..."}
15. maps: {"address": "123 Main St", "lat": 40.71, "lng": -74.00, "zoom": 15, "height": 380}
16. whatsapp: {"phone": "+15551234567", "buttonText": "Chat on WhatsApp", "defaultText": "Hi! Inquiring about services.", "availability": "Replies in 10 mins"}
17. timeline: {"items": [{"period": "2024", "role": "Lead", "company": "Studio", "desc": "..."}]}
18. blog: {"posts": [{"title": "...", "desc": "...", "image": "https://...", "url": "#"}]}
19. video: {"embedUrl": "https://youtube.com/embed/...", "coverImage": "https://..."}
20. cta: {"ctaText": "Join Now", "ctaLink": "#", "secondaryCtaText": "Learn More", "secondaryCtaLink": "#"}
21. about: {"bio": "...", "avatar": "https://...", "skills": ["UI/UX", "Next.js", "AI"]}
22. custom_html: {"html": "<div class='...'>...</div>"}
23. custom_template: {"templateId": "noir-premium", "data": {...}}
24. footer: {"title": "Brand Inc"}
`;

export const AI_COMMAND_PROMPTS = [
  {
    id: "cmd_noir",
    title: "1. Luxury Animated Creator Link-in-Bio (Noir Style)",
    desc: "Generates a bespoke animated link-in-bio template with dark gold glass aesthetic, glowing avatar, stats, curated links, gallery, and socials.",
    prompt: `${UNIVERSAL_AI_MASTER_PROMPT}

USER TASK:
Create a luxury, high-converting "link_in_bio" template using the "custom_template" architecture with templateId "noir-premium".
Theme: Deep obsidian background (#0A0A12), royal gold secondary (#E8C77E), electric violet primary (#9B8CFB), soft rose accent (#F6A8C7).
Include:
- Profile: Name, role, bio, and avatar.
- Badge: "✨ Available for Collabs"
- Stats: 3 realistic metrics (e.g. Followers, Views, Projects).
- Links: 6 curated links including featured art drops, YouTube video, presets, and booking calendar.
- Gallery: 4 high-resolution Unsplash photo URLs.
- Socials: Instagram, Twitter/X, YouTube, LinkedIn.
- Footer: Copyright and contact.

Output ONLY strictly valid JSON.`,
  },
  {
    id: "cmd_saas",
    title: "2. Modern High-Converting SaaS & AI Startup Landing Page",
    desc: "Generates a multi-section startup landing page with sticky navbar, hero with stats, features grid, 3-tier pricing, customer testimonials, FAQ, and footer.",
    prompt: `${UNIVERSAL_AI_MASTER_PROMPT}

USER TASK:
Create a modern, high-converting "startup_landing" template with 7 complete native sections:
1. "navbar": Sticky header with 4 nav links and primary "Start Free Trial" CTA.
2. "hero": High-impact hero with badge ("🚀 NEXT-GEN AI WORKSPACE"), title, subtitle, primary/secondary CTAs, high-res dashboard screenshot image, and 3 proof metrics.
3. "features": 6-item grid with icons (Zap, Sparkles, Shield, Cpu, Layers, Globe) and compelling descriptions.
4. "pricing": 3-tier subscription table (Starter $19, Pro $49 with "Popular" badge, Enterprise $149) with feature checklists and action buttons.
5. "testimonials": 3 customer reviews with real quotes, author names, roles, and avatar URLs.
6. "faq": 5 frequently asked questions and clear answers.
7. "footer": Company links, social channels, and copyright.

Theme: Modern Indigo Dark (#090D16 background, #6366F1 primary, #A855F7 secondary, Outfit heading font, Inter body font).
Output ONLY strictly valid JSON.`,
  },
  {
    id: "cmd_dining",
    title: "3. Fine Dining Restaurant & Bar Menu with WhatsApp Booking",
    desc: "Generates an elegant restaurant template with categorized menu items, price tags, signatures, photo gallery, and direct WhatsApp reservation.",
    prompt: `${UNIVERSAL_AI_MASTER_PROMPT}

USER TASK:
Create a luxury "restaurant_menu" template with native sections:
1. "navbar": Brand title with menu links.
2. "hero": Warm cinematic culinary photography background, gold badge ("MICHELIN GUIDE 2026"), title, subtitle, and "Reserve Table" CTA.
3. "about": The Chef's story, culinary philosophy, and awards.
4. "menu_list": 3 categories (Starters, Chef's Signatures, Desserts & Cocktails) with prices, rich descriptions, and "Chef's Pick" badges.
5. "gallery": 4 interior and dish photos from Unsplash.
6. "whatsapp": Direct table booking button with pre-filled message ("Hi! I would like to reserve a table for tonight.") and "+1" phone number.
7. "footer": Hours of operation, address, and copyright.

Theme: Warm Luxury Dark (#0F0E11 background, #D4AF37 gold primary, #8B0000 crimson accent, Playfair Display heading font).
Output ONLY strictly valid JSON.`,
  },
  {
    id: "cmd_portfolio",
    title: "4. Creative Director & Agency Portfolio Showcase",
    desc: "Generates an award-winning creative studio portfolio with visual case studies, services list with pricing, client reviews, and project inquiry form.",
    prompt: `${UNIVERSAL_AI_MASTER_PROMPT}

USER TASK:
Create a striking "portfolio" template for a top-tier Creative Director / Design Agency:
1. "navbar": Minimalist studio branding with links.
2. "hero": Bold typography ("Crafting Digital Products That Define Tomorrow"), pill badge, reel cover, and availability status.
3. "portfolio_grid": 4 featured case studies with high-res cover images, tags (e.g. "Fintech", "Brand Identity", "AI Platform"), and case study links.
4. "services": 4 core offerings (Brand Strategy, UI/UX Architecture, Mobile Apps, Motion Design) with icons and price ranges.
5. "testimonials": 2 executive endorsements with avatars and company names.
6. "contact": Studio email, phone number, address, and social links.
7. "footer": Studio copyright.

Theme: Editorial Monolith (#050505 background, #FFFFFF text, #3B82F6 electric blue accent, Syne or Space Grotesk heading font).
Output ONLY strictly valid JSON.`,
  },
  {
    id: "cmd_vcard",
    title: "5. Digital NFC Business Card & Executive Profile",
    desc: "Generates a compact digital business card with quick contact actions, vCard export, social channels, career timeline, and meeting booking link.",
    prompt: `${UNIVERSAL_AI_MASTER_PROMPT}

USER TASK:
Create a sleek "digital_card" template:
1. "digital_card": High-res executive avatar, name, executive title, badge ("💳 Verified Profile"), bio, location, primary "Save Contact" CTA, email, phone, LinkedIn, Twitter, and custom links (e.g. "Book 15-min Call", "Company Overview", "Download CV").
2. "timeline": 3 career milestone entries (e.g. Current VP Role, Previous Lead Architect, Education).
3. "contact": Direct contact details and calendar booking link.

Theme: Executive Slate (#0B0F19 background, #2563EB royal blue primary, #10B981 emerald accent, Outfit heading font).
Output ONLY strictly valid JSON.`,
  },
];

interface AdminTemplateGuideModalProps {
  onClose: () => void;
}

export function AdminTemplateGuideModal({ onClose }: AdminTemplateGuideModalProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<
    "ai_prompt" | "sections" | "bindings" | "theme" | "rules" | "css" | "boilerplate"
  >("ai_prompt");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySnippet = (key: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("Copied to clipboard!", "Snippet is ready to paste.");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleCopyFullGuideForAi = () => {
    try {
      navigator.clipboard.writeText(UNIVERSAL_AI_MASTER_PROMPT.trim());
      setCopiedKey("full_ai_guide");
      toast.success(
        "Copied Universal AI Master Prompt!",
        "Paste this specification directly into ChatGPT, Claude, Gemini, or Cursor."
      );
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ─────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                <span>Universal AI Template Prompt &amp; Specification Guide</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Universal AI Compatible
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact JSON attribute references, visual editor bindings, and 1-click prompts for ChatGPT, Claude &amp; Gemini.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Universal AI Master Prompt */}
            <button
              onClick={handleCopyFullGuideForAi}
              className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-600 hover:from-indigo-500 hover:to-sky-500 transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95"
              title="Copy complete Master Prompt for any AI"
            >
              {copiedKey === "full_ai_guide" ? (
                <Check size={14} className="text-emerald-300" />
              ) : (
                <Sparkles size={14} className="text-amber-300" />
              )}
              <span>{copiedKey === "full_ai_guide" ? "Copied Master AI Prompt!" : "Copy Master AI Prompt"}</span>
            </button>

            {/* Search within guide */}
            <div className="relative w-40 sm:w-52 hidden sm:block">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search guide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
            { id: "ai_prompt", label: "🤖 Universal AI Prompt & Commands", icon: Bot },
            { id: "sections", label: "Section & Content Specs (24)", icon: Layers },
            { id: "bindings", label: "Visual Editor Element Keys", icon: SlidersHorizontal },
            { id: "theme", label: "Theme Engine & Google Fonts", icon: Palette },
            { id: "rules", label: "Critical JSON Rules", icon: AlertTriangle },
            { id: "css", label: "Custom CSS & Scoping", icon: Code },
            { id: "boilerplate", label: "Ready Boilerplates", icon: Sparkles },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* TAB 0: UNIVERSAL AI PROMPT & COMMANDS */}
          {activeTab === "ai_prompt" && (
            <div className="space-y-6 animate-fade-in">
              {/* Master Prompt Hero Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-700/50 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Universal AI Master Generator Prompt</h4>
                      <p className="text-xs text-indigo-200 mt-0.5">
                        Copy this master specification into <strong>ChatGPT, Claude, Gemini, DeepSeek, or Cursor</strong> to generate 100% compatible templates.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyFullGuideForAi}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
                  >
                    {copiedKey === "full_ai_guide" ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === "full_ai_guide" ? "Copied to Clipboard!" : "Copy Master AI Prompt"}</span>
                  </button>
                </div>

                {/* 3 Simple Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-indigo-800/40">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-900/40 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Step 1</span>
                    <p className="text-xs text-slate-200 font-semibold">Copy Master Prompt</p>
                    <p className="text-[11px] text-slate-400">Click the button above to copy the complete specification.</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-900/40 space-y-1">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Step 2</span>
                    <p className="text-xs text-slate-200 font-semibold">Paste Into Any AI</p>
                    <p className="text-[11px] text-slate-400">Use as the System Prompt in ChatGPT, Claude, Gemini, or Cursor.</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-900/40 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Step 3</span>
                    <p className="text-xs text-slate-200 font-semibold">Copy Ready Commands</p>
                    <p className="text-[11px] text-slate-400">Copy any command below or ask for your custom theme/vibe.</p>
                  </div>
                </div>
              </div>

              {/* JSON Attributes Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-sky-400" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                    JSON Attribute Reference: What Every Key Does
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-mono font-bold text-indigo-400">"meta" Object</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li><code className="text-sky-300">id / slug</code>: Unique URL path and identifier (e.g. "luxe-dining").</li>
                      <li><code className="text-sky-300">title</code>: Human-readable name displayed on gallery cards.</li>
                      <li><code className="text-sky-300">category</code>: Gallery filter category (portfolio, link_in_bio, business, etc.).</li>
                      <li><code className="text-sky-300">tags</code>: Array of search keywords (["Luxury", "Dark", "Animated"]).</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-mono font-bold text-indigo-400">"theme" Design Tokens</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li><code className="text-sky-300">primary / secondaryColor</code>: Main CTA and gradient highlights.</li>
                      <li><code className="text-sky-300">backgroundColor</code>: Deep hex = dark mode; bright = auto-light mode.</li>
                      <li><code className="text-sky-300">headingFont / bodyFont</code>: Any Google Font! (Outfit, Syne, Inter, etc.).</li>
                      <li><code className="text-sky-300">borderRadius / cardVariant</code>: "16px", "pill", "glass" (frosted cards).</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-mono font-bold text-indigo-400">"sections" Architecture</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li><code className="text-sky-300">id / type</code>: Unique section ID and one of the 24 supported types.</li>
                      <li><code className="text-sky-300">title / subtitle</code>: Headings bound to canvas click-to-edit.</li>
                      <li><code className="text-sky-300">badge</code>: Top tag badge above heading ("✨ NEW DROP").</li>
                      <li><code className="text-sky-300">content</code>: Type-specific schema holding items, links, or photos.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-mono font-bold text-indigo-400">"custom_template" Support</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li><code className="text-sky-300">templateId</code>: "noir-premium" (triggers bespoke luxury UI).</li>
                      <li><code className="text-sky-300">data.profile</code>: Avatar photo, name, role, and bio story.</li>
                      <li><code className="text-sky-300">data.links / gallery</code>: Curated links and 4-frame photo gallery.</li>
                      <li><code className="text-sky-300">data.socials</code>: Direct icons for Instagram, Twitter, YouTube, LinkedIn.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Ready-to-Use Copyable AI Commands */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                      5 Ready-to-Use Copyable AI Prompt Commands
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Click "Copy Command Prompt", paste into ChatGPT or Claude, and receive a fully formed, visual-editor-supported template.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {AI_COMMAND_PROMPTS.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{item.title}</span>
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => copySnippet(item.id, item.prompt.trim())}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                        >
                          {copiedKey === item.id ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedKey === item.id ? "Copied Prompt!" : "Copy Prompt Command"}</span>
                        </button>
                      </div>

                      <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-24 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{item.prompt.slice(0, 320)}…</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                      <b className="text-white">Unique <code className="text-sky-300">meta.slug</code>:</b> Slugs are used as unique identifiers and HTML container classes (<code className="text-sky-300">Oninsite-tpl-{"<slug>"}</code>).
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
                              author: "OkInSite AI",
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
                    className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
                  >
                    {copiedKey === "top_level" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === "top_level" ? "Copied" : "Copy Skeleton"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                  {`{
  "meta": {
    "id": "my-template",
    "slug": "my-template",
    "title": "My Template",
    "category": "portfolio",
    "description": "...",
    "tags": ["modern", "dark"],
    "status": "published"
  },
  "theme": { ... },
  "sections": [ ... ],
  "seo": { "metaTitle": "...", "metaDescription": "..." },
  "customCode": { "html": "", "css": "", "js": "" }
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: THEME ENGINE */}
          {activeTab === "theme" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Palette size={14} className="text-sky-400" />
                    Theme Tokens &amp; Google Fonts Engine
                  </h4>
                  <button
                    onClick={() =>
                      copySnippet(
                        "theme_tokens",
                        JSON.stringify(
                          {
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
                          null,
                          2
                        )
                      )
                    }
                    className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
                  >
                    {copiedKey === "theme_tokens" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === "theme_tokens" ? "Copied" : "Copy Theme Object"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The renderer converts these tokens into CSS Custom Properties (<code className="text-sky-300">--primary</code>, <code className="text-sky-300">--bg</code>, <code className="text-sky-300">--text-main</code>). The luminance detector checks <code className="text-sky-300">backgroundColor</code>; if bright (e.g. #FFFFFF or #FBF7EE), it automatically ensures high contrast for all cards and text.
                </p>
                <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto">
{`"theme": {
  "mode": "dark",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#8B5CF6",
  "accentColor": "#F59E0B",
  "backgroundColor": "#090D16",
  "textColor": "#F8FAFC",
  "headingFont": "Outfit",
  "bodyFont": "Inter",
  "borderRadius": "16px",
  "buttonVariant": "pill",
  "cardVariant": "glass",
  "shadow": "lg",
  "spacingScale": "comfortable",
  "animations": true
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SECTIONS SPEC */}
          {activeTab === "sections" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-700/40 text-xs text-indigo-200">
                <p className="font-bold text-sm text-indigo-100 mb-1">24 Supported Section Types</p>
                Every section below has a verified schema. Click any section's copy button to grab its exact snippet.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    type: "custom_template",
                    title: "custom_template (Bespoke Schema Template)",
                    badge: "✨ Recommended for Luxury",
                    desc: "Full bespoke UI (like Noir Bio) with 100% visual editor compatibility.",
                    snippet: {
                      id: "tpl-noir-main",
                      type: "custom_template",
                      content: {
                        templateId: "noir-premium",
                        data: {
                          profile: { name: "Noor Ali", role: "Photographer & Storyteller", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" },
                          badge: "✨ Available for Collabs",
                          stats: [{ value: "318K", label: "Followers" }],
                          links: [{ label: "Shop Prints", url: "https://...", badge: "NEW" }],
                          gallery: [{ url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&q=80", alt: "Dunes" }],
                          socials: { instagram: "https://...", twitter: "https://..." },
                          footerText: "© 2026 Noor Ali"
                        }
                      }
                    }
                  },
                  {
                    type: "hero",
                    title: "hero (Hero Banner & Stats)",
                    desc: "Main hero title, subtitle, CTA buttons, avatar/bgImage, and statistics row.",
                    snippet: {
                      id: "hero-1",
                      type: "hero",
                      title: "Next-Gen AI Platform",
                      subtitle: "Build your digital presence in seconds.",
                      badge: "🚀 V2 RELEASE",
                      content: {
                        ctaText: "Get Started Free",
                        ctaLink: "#pricing",
                        secondaryCtaText: "Explore Features",
                        secondaryCtaLink: "#features",
                        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
                        stats: [{ label: "Users", value: "100K+" }, { label: "Uptime", value: "99.9%" }]
                      }
                    }
                  },
                  {
                    type: "links",
                    title: "links (Link in Bio Aggregator)",
                    desc: "List of featured buttons for links, social handles, and WhatsApp chat.",
                    snippet: {
                      id: "links-1",
                      type: "links",
                      title: "@AlexRivera",
                      subtitle: "Creator & Product Architect",
                      content: {
                        links: [
                          { label: "My Portfolio", url: "https://...", badge: "FEATURED", icon: "Globe" },
                          { label: "YouTube Channel", url: "https://...", icon: "Play" },
                          { label: "Chat on WhatsApp", url: "https://wa.me/15551234567", icon: "MessageCircle" }
                        ]
                      }
                    }
                  },
                  {
                    type: "features",
                    title: "features (Grid of Capabilities)",
                    desc: "3 to 6 capability cards with icon, title, and description.",
                    snippet: {
                      id: "feat-1",
                      type: "features",
                      title: "Why Choose OkInSite",
                      subtitle: "Everything you need to scale your brand.",
                      content: {
                        items: [
                          { title: "Lightning Fast", desc: "Edge CDN deployed worldwide with sub-second speeds.", icon: "Zap" },
                          { title: "AI Visual Builder", desc: "Edit text, colors, and layout directly on the canvas.", icon: "Sparkles" },
                          { title: "Custom Domains", desc: "Connect your dedicated URL with free SSL included.", icon: "Globe" }
                        ]
                      }
                    }
                  },
                  {
                    type: "pricing",
                    title: "pricing (Tiered Subscription Plans)",
                    desc: "Tiered cards with price, billing period, features list, and action buttons.",
                    snippet: {
                      id: "price-1",
                      type: "pricing",
                      title: "Simple, Transparent Pricing",
                      subtitle: "No surprise fees. Cancel anytime.",
                      content: {
                        plans: [
                          { name: "Starter", price: "$0", period: "/mo", buttonText: "Start Free", features: ["1 Custom Site", "Analytics", "Community Support"] },
                          { name: "Pro", price: "$29", period: "/mo", isPopular: true, badge: "Popular", buttonText: "Go Pro", features: ["Unlimited Sites", "Custom Domain", "Priority Support"] }
                        ]
                      }
                    }
                  },
                  {
                    type: "menu_list",
                    title: "menu_list (Restaurant & Bar Menu)",
                    desc: "Categorized menu items with prices, descriptions, and dietary badges.",
                    snippet: {
                      id: "menu-1",
                      type: "menu_list",
                      title: "Seasonal Tasting Menu",
                      subtitle: "Locally sourced organic ingredients.",
                      content: {
                        categories: [
                          {
                            name: "Chef's Signatures",
                            items: [
                              { name: "Truffle Tagliolini", desc: "Handmade pasta, aged parmesan, fresh black truffle.", price: "$36", badge: "Signature" },
                              { name: "Wagyu Ribeye", desc: "A5 Miyazaki beef, roasted bone marrow jus.", price: "$68", badge: "Popular" }
                            ]
                          }
                        ]
                      }
                    }
                  },
                ].map((s) => (
                  <div key={s.type} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{s.title}</span>
                        {s.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {s.badge}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => copySnippet(s.type, JSON.stringify(s.snippet, null, 2))}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Copy section JSON"
                      >
                        {copiedKey === s.type ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">{s.desc}</p>
                    <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-32">
                      {JSON.stringify(s.snippet, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BINDINGS */}
          {activeTab === "bindings" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-sky-400" />
                  Visual Editor Element Key Protocol (data-element-key)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When a user clicks on an element in the visual canvas, the editor inspects the element’s <code className="text-sky-300">data-element-key</code> attribute to immediately scroll to and focus the corresponding input in the sidebar inspector.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <b className="text-emerald-400 font-mono">title / subtitle / badge</b>
                    <p className="text-[11px] text-slate-400">Direct top-level section properties. Auto-highlighted when clicked.</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <b className="text-indigo-400 font-mono">avatar / image / url / bgImage</b>
                    <p className="text-[11px] text-slate-400">Triggers the Image Picker Modal for instant image upload and replacement.</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <b className="text-sky-400 font-mono">content.items.0.title</b>
                    <p className="text-[11px] text-slate-400">Indexed item array key. Flashes the specific array card in the inspector.</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <b className="text-amber-400 font-mono">content.data.profile.name</b>
                    <p className="text-[11px] text-slate-400">Custom template schema path. Flashes the profile name in custom templates.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CSS & SCOPING */}
          {activeTab === "css" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Code size={14} className="text-sky-400" />
                  Custom CSS Scoping &amp; JavaScript Rules
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Always prefix custom CSS selectors with <code className="text-sky-300">body.tpl-{"<slug>"}</code>. The renderer automatically sanitizes and rewrites selectors into <code className="text-sky-300">.Oninsite-tpl-{"<slug>"}</code> so styles cannot leak into the rest of the application.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: BOILERPLATES */}
          {activeTab === "boilerplate" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white">Complete Ready Boilerplates</h4>
                  <button
                    onClick={() =>
                      copySnippet(
                        "noir_boilerplate",
                        JSON.stringify(
                          {
                            meta: { id: "noir-bio-premium", slug: "noir-bio-premium", title: "Noir Bio — Premium", category: "link_in_bio" },
                            theme: { mode: "dark", primaryColor: "#9B8CFB", secondaryColor: "#E8C77E", backgroundColor: "#0A0A12", textColor: "#F5F3FF", headingFont: "Outfit", bodyFont: "Inter" },
                            sections: [
                              {
                                id: "noir-bio-main",
                                type: "custom_template",
                                content: {
                                  templateId: "noir-premium",
                                  data: {
                                    profile: { name: "Noor Ali", role: "Photographer & Visual Storyteller", bio: "Capturing quiet cinematic moments.", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" },
                                    badge: "✨ Available for Collabs",
                                    stats: [{ value: "318K", label: "Followers" }],
                                    links: [{ label: "Shop Prints", url: "https://...", badge: "NEW" }]
                                  }
                                }
                              }
                            ]
                          },
                          null,
                          2
                        )
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
                  >
                    {copiedKey === "noir_boilerplate" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === "noir_boilerplate" ? "Copied" : "Copy Noir Boilerplate"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Ready-to-use template JSONs tested for 100% visual editor compatibility.
                </p>
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
              {copiedKey === "full_ai_guide" ? (
                <Check size={14} className="text-emerald-300" />
              ) : (
                <Sparkles size={14} className="text-amber-300" />
              )}
              <span>
                {copiedKey === "full_ai_guide"
                  ? "Copied Universal AI Master Prompt!"
                  : "Copy Universal AI Master Prompt"}
              </span>
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Paste directly into ChatGPT / Claude / Gemini system prompts
            </span>
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
