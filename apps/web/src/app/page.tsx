"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  Lock,
  Zap,
  Smartphone,
  Server,
  Share2,
  ShieldCheck,
  Sparkles,
  Search,
  Store,
  Palette,
  Briefcase,
  Utensils,
  ShoppingBag,
  FileText,
  User,
  Sliders,
  Send,
  QrCode,
  Instagram,
  Youtube,
  Linkedin,
  ChevronDown,
  X,
  Menu,
  Activity,
} from "lucide-react";
import { TemplateThumbnail } from "@/components/renderer/TemplateThumbnail";
import { SiteCreationModal } from "@/components/common/SiteCreationModal";
import { projectsApi, templatesApi } from "@/lib/api";
import { BusinessProfile, injectBusinessProfileIntoConfig } from "@/lib/businessProfile";

// ── Featured Showcase Template Configurations ────────────────────────────────
const VELORA_SALON_CONFIG: any = {
  meta: {
    id: "velora-salon-spa",
    slug: "velora-salon-spa",
    title: "Velora Salon & Spa",
    description: "A luxury salon & spa experience with bespoke treatments.",
    category: "business",
  },
  theme: {
    primaryColor: "#C9A227",
    secondaryColor: "#0B3B2E",
    accentColor: "#E7C9A9",
    backgroundColor: "#071F18",
    textColor: "#F7F3EA",
    fontFamily: "Inter",
    borderRadius: "16px",
    mode: "dark",
  },
  sections: [
    {
      id: "navbar",
      type: "navbar",
      variant: "transparent",
      content: {
        title: "Velora Salon & Spa",
        ctaText: "Book Appointment",
        ctaLink: "#contact",
      },
    },
    {
      id: "hero",
      type: "hero",
      title: "Radiance, Redefined.",
      subtitle: "Bespoke hair artistry, restorative skin therapies, and luxury wellness rituals.",
      badge: "Velora Signature Rituals",
      content: {
        ctaText: "Explore Rituals",
        ctaLink: "#services",
      },
    },
    {
      id: "services",
      type: "services",
      title: "Signature Rituals",
      subtitle: "Curated therapies designed for total renewal.",
      content: {
        items: [
          { title: "Bespoke Balayage & Cut", desc: "Hand-painted dimensional color tailored to your natural movement." },
          { title: "Velora Glow Facial", desc: "Cold-pressed botanicals paired with micro-exfoliation and gua sha." },
          { title: "Japanese Botanical Head Spa", desc: "Deep scalp detox and herbal steam therapy." },
        ],
      },
    },
    {
      id: "pricing",
      type: "pricing",
      title: "Curated Packages",
      subtitle: "Transparent pricing for exceptional care.",
      content: {
        plans: [
          { name: "Essential Glow", price: "$120", period: "session", features: ["Consultation", "Artisan Wash", "Blowout", "Scalp Serum"] },
          { name: "The Velora Signature", price: "$280", period: "session", popular: true, features: ["Full Dimensional Color", "Custom Cut", "Botanical Head Spa", "Home Care Kit"] },
        ],
      },
    },
  ],
  customCode: {
    html: "",
    js: "",
    css: `/* =========================================================
   VELORA SALON & SPA — PREMIUM MOTION SYSTEM
   ========================================================= */
body {
  --vl-gold: #C9A227;
  --vl-gold-light: #E7C9A9;
  --vl-emerald: #0B3B2E;
  --vl-cream: #F7F3EA;
  --vl-border: rgba(201,162,39,.22);
  --vl-ease: cubic-bezier(.16,1,.3,1);
  overflow-x: hidden;
  background: radial-gradient(circle at 12% 8%, rgba(201,162,39,.12), transparent 28%),
    radial-gradient(circle at 88% 28%, rgba(231,201,169,.08), transparent 26%),
    linear-gradient(135deg, #071F18 0%, #0B3B2E 48%, #071F18 100%);
  color: var(--vl-cream);
}
body .navbar, body nav {
  backdrop-filter: blur(18px) saturate(140%);
  background: linear-gradient(180deg, rgba(11,59,46,.88), rgba(11,59,46,.58));
  border-bottom: 1px solid rgba(201,162,39,.14);
  box-shadow: 0 10px 40px rgba(0,0,0,.16);
}
body #hero {
  position: relative; isolation: isolate;
  min-height: 720px; overflow: hidden;
  background: radial-gradient(circle at 75% 35%, rgba(201,162,39,.16), transparent 30%),
    radial-gradient(circle at 10% 80%, rgba(231,201,169,.07), transparent 25%);
}
body #hero::before {
  content: "";
  position: absolute;
  width: 520px; height: 520px;
  right: -180px; top: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201,162,39,.18), rgba(201,162,39,.05) 35%, transparent 70%);
  filter: blur(8px);
  animation: vlAura 9s ease-in-out infinite alternate;
  pointer-events: none; z-index: -1;
}
@keyframes vlAura {
  0% { transform: scale(.85) translate3d(0,20px,0); opacity: .55; }
  100% { transform: scale(1.15) translate3d(-40px,-20px,0); opacity: 1; }
}
body #hero::after {
  content: "";
  position: absolute; inset: 0;
  pointer-events: none;
  background: linear-gradient(120deg, transparent 35%, rgba(255,255,255,.025) 50%, transparent 65%);
  background-size: 220% 100%;
  animation: vlSweep 10s linear infinite;
}
@keyframes vlSweep {
  0% { background-position: 180% 0; }
  100% { background-position: -40% 0; }
}
body #hero h1 {
  letter-spacing: -.045em; line-height: .94;
  background: linear-gradient(105deg, #F7F3EA 5%, #E7C9A9 40%, #C9A227 65%, #FFF4CF 85%, #F7F3EA 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
  animation: vlGoldText 7s ease-in-out infinite alternate;
}
@keyframes vlGoldText {
  0% { background-position: 0% center; }
  100% { background-position: 100% center; }
}
body #services { position: relative; isolation: isolate; }
body #services::before {
  content: "";
  position: absolute;
  width: 360px; height: 360px;
  left: -180px; top: 20%;
  border-radius: 50%;
  background: rgba(201,162,39,.08);
  filter: blur(90px);
  animation: vlOrb 12s ease-in-out infinite alternate;
  pointer-events: none; z-index: -1;
}
@keyframes vlOrb {
  from { transform: translate3d(0,0,0) scale(.8); }
  to { transform: translate3d(100px,-50px,0) scale(1.2); }
}
body #services article, body #services [class*="card"],
body #services [class*="Card"] {
  position: relative; overflow: hidden;
  border: 1px solid var(--vl-border);
  background: linear-gradient(145deg, rgba(255,255,255,.065), rgba(255,255,255,.018));
  backdrop-filter: blur(18px);
  box-shadow: 0 20px 55px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.045);
  transition: transform .6s var(--vl-ease), box-shadow .6s var(--vl-ease), border-color .6s var(--vl-ease);
}
body #services article:hover, body #services [class*="card"]:hover {
  transform: translateY(-10px);
  border-color: rgba(201,162,39,.48);
  box-shadow: 0 30px 80px rgba(0,0,0,.26), 0 0 45px rgba(201,162,39,.09);
}
body section h2 {
  letter-spacing: -.035em;
  background: linear-gradient(110deg, #F7F3EA, #E7C9A9 40%, #C9A227 70%, #FFF1C8);
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
}
body section > * { animation: vlReveal .9s var(--vl-ease) both; }
body section > *:nth-child(2) { animation-delay: .08s; }
body section > *:nth-child(3) { animation-delay: .16s; }
@keyframes vlReveal {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
body footer {
  position: relative;
  border-top: 1px solid rgba(201,162,39,.13);
  background: linear-gradient(180deg, rgba(5,25,19,.35), rgba(3,17,13,.85));
}`,
  },
};

const GYM_BOLD_CONFIG: any = {
  meta: {
    id: "stronger-studio-fitness-coach",
    slug: "stronger-studio-fitness-coach",
    title: "Iron Forge Gym",
    description: "High-performance strength, conditioning & athletic coaching.",
    category: "business",
  },
  theme: {
    primaryColor: "#F97316",
    secondaryColor: "#18181B",
    accentColor: "#FACC15",
    backgroundColor: "#09090B",
    textColor: "#FAFAFA",
    fontFamily: "Inter",
    borderRadius: "12px",
    mode: "dark",
  },
  sections: [
    {
      id: "navbar",
      type: "navbar",
      variant: "solid",
      content: {
        title: "Iron Forge Gym",
        ctaText: "Start Training",
        ctaLink: "#pricing",
      },
    },
    {
      id: "hero",
      type: "hero",
      title: "Built For The Relentless.",
      subtitle: "Elite strength training, functional conditioning, and custom athlete coaching.",
      badge: "Open 24/7 · Downtown",
      content: {
        ctaText: "Claim 7-Day Pass",
        ctaLink: "#contact",
      },
    },
    {
      id: "features",
      type: "features",
      title: "Training Programs",
      subtitle: "Engineered for raw progression and longevity.",
      content: {
        items: [
          { title: "Heavy Barbell & Powerlifting", desc: "Competition-grade Eleiko racks, calibrated plates, and dedicated deadlift platforms." },
          { title: "Functional HIIT & Conditioning", desc: "High-tempo metabolic conditioning circuits for cardiovascular power." },
          { title: "1-on-1 Athlete Coaching", desc: "Personalized biomechanics analysis, nutrition programming, and weekly check-ins." },
        ],
      },
    },
    {
      id: "pricing",
      type: "pricing",
      title: "Memberships",
      subtitle: "No contracts. Transparent pricing.",
      content: {
        plans: [
          { name: "Standard Access", price: "$69", period: "month", features: ["24/7 Facility Access", "Locker Room & Sauna", "Mobile App Access"] },
          { name: "Athlete Pro", price: "$149", period: "month", popular: true, features: ["All Standard Features", "Unlimited HIIT Classes", "Monthly Coaching Review", "Recovery Zone"] },
        ],
      },
    },
  ],
  customCode: {
    html: "",
    js: "",
    css: `/* =========================================================
   IRON FORGE GYM — BOLD MOTION SYSTEM
   ========================================================= */
body {
  --gym-orange: #F97316;
  --gym-yellow: #FACC15;
  --gym-dark: #09090B;
  --gym-ease: cubic-bezier(.16,1,.3,1);
  overflow-x: hidden;
  background: radial-gradient(ellipse at 50% -10%, rgba(249,115,22,.18), transparent 45%),
    linear-gradient(180deg, #09090B 0%, #18181B 100%);
  color: #FAFAFA;
}
body .navbar, body nav {
  background: rgba(9,9,11,.92);
  border-bottom: 1px solid rgba(249,115,22,.2);
  backdrop-filter: blur(16px);
  box-shadow: 0 4px 30px rgba(0,0,0,.4), 0 0 0 1px rgba(249,115,22,.08) inset;
}
body #hero {
  position: relative; isolation: isolate;
  min-height: 700px; overflow: hidden;
}
body #hero::before {
  content: "";
  position: absolute;
  width: 600px; height: 300px;
  left: 50%; top: 0;
  transform: translateX(-50%);
  background: radial-gradient(ellipse, rgba(249,115,22,.22), transparent 65%);
  filter: blur(40px);
  animation: gymPulse 6s ease-in-out infinite alternate;
  pointer-events: none; z-index: -1;
}
@keyframes gymPulse {
  0% { opacity: .6; transform: translateX(-50%) scaleX(.85); }
  100% { opacity: 1; transform: translateX(-50%) scaleX(1.15); }
}
body #hero h1 {
  letter-spacing: -.04em; line-height: .92;
  background: linear-gradient(100deg, #FAFAFA 20%, #FACC15 55%, #F97316 80%, #FAFAFA 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
  animation: gymText 5s ease-in-out infinite alternate;
}
@keyframes gymText {
  0% { background-position: 0% center; }
  100% { background-position: 100% center; }
}
body #hero button, body #hero a[class*="btn"] {
  position: relative; overflow: hidden;
  background: linear-gradient(90deg, #F97316, #EA580C);
  box-shadow: 0 0 0 0 rgba(249,115,22,.5);
  animation: gymCTAPulse 2.5s ease-in-out infinite;
}
@keyframes gymCTAPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,.5); }
  50% { box-shadow: 0 0 0 12px rgba(249,115,22,0); }
}
body #features article, body #features [class*="card"],
body #services article, body #services [class*="card"] {
  border: 1px solid rgba(249,115,22,.18);
  background: linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
  backdrop-filter: blur(14px);
  box-shadow: 0 15px 40px rgba(0,0,0,.25);
  transition: transform .5s var(--gym-ease), box-shadow .5s var(--gym-ease), border-color .5s var(--gym-ease);
}
body #features article:hover, body #features [class*="card"]:hover,
body #services article:hover, body #services [class*="card"]:hover {
  transform: translateY(-8px) scale(1.01);
  border-color: rgba(249,115,22,.5);
  box-shadow: 0 25px 60px rgba(0,0,0,.35), 0 0 30px rgba(249,115,22,.12);
}
body section h2 {
  letter-spacing: -.035em;
  background: linear-gradient(100deg, #FAFAFA, #FACC15 50%, #F97316);
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
}
body section > * { animation: gymReveal .8s var(--gym-ease) both; }
body section > *:nth-child(2) { animation-delay: .1s; }
body section > *:nth-child(3) { animation-delay: .2s; }
@keyframes gymReveal {
  from { opacity: 0; transform: translateY(24px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
body footer {
  border-top: 1px solid rgba(249,115,22,.15);
  background: linear-gradient(180deg, rgba(9,9,11,.5), rgba(9,9,11,.95));
}`,
  },
};

const LINK_IN_BIO_CONFIG: any = {
  meta: {
    id: "kai-chen-bio",
    slug: "kai-chen-bio",
    title: "Alex Rivera",
    description: "Developer, tech reviewer, and digital creator.",
    category: "link_in_bio",
  },
  theme: {
    primaryColor: "#06B6D4",
    secondaryColor: "#1E293B",
    accentColor: "#3B82F6",
    backgroundColor: "#0F172A",
    textColor: "#F8FAFC",
    fontFamily: "Inter",
    borderRadius: "16px",
    mode: "glassmorphism",
  },
  sections: [
    {
      id: "sec_card",
      type: "digital_card",
      variant: "centered",
      title: "Alex Rivera",
      subtitle: "Tech Creator & Software Architect",
      content: {
        bio: "Reviewing developer gear, building in public, and sharing engineering essays with 120K readers.",
        socials: {
          email: "alex@rivera.dev",
          youtube: "https://youtube.com",
          twitter: "https://twitter.com",
          github: "https://github.com",
        },
      },
    },
    {
      id: "sec_links",
      type: "links",
      variant: "centered",
      title: "Featured Links",
      content: {
        links: [
          { label: "Watch Latest Workspace Setup Tour", url: "https://youtube.com" },
          { label: "Read Monthly Engineering Newsletter", url: "https://substack.com" },
          { label: "Download Free Design System Kit", url: "https://github.com" },
          { label: "Book 1-on-1 Architecture Consultation", url: "#contact" },
        ],
      },
    },
  ],
};

// ── Presence Types Grid ──────────────────────────────────────────────────────
const PRESENCE_ITEMS = [
  {
    id: "business",
    category: "business",
    title: "Business",
    desc: "Turn your business into a professional online destination.",
    subtext: "Services, pricing, location, lead forms & customer inquiries.",
    subdomain: "apex.okinsite.com",
    icon: Store,
    badge: "Local & Services",
    accent: "from-blue-500/10 to-indigo-500/5",
    color: "text-blue-600",
  },
  {
    id: "creator",
    category: "creator",
    title: "Creator",
    desc: "Showcase your work, content, links, and collaborations.",
    subtext: "Videos, social channels, newsletters, media kits & sponsorships.",
    subdomain: "maya.okinsite.com",
    icon: Palette,
    badge: "Creators & Media",
    accent: "from-violet-500/10 to-purple-500/5",
    color: "text-violet-600",
  },
  {
    id: "portfolio",
    category: "portfolio",
    title: "Portfolio",
    desc: "Turn your work into an impressive personal portfolio.",
    subtext: "Case studies, visual galleries, client reviews & hire me action.",
    subdomain: "alex.okinsite.com",
    icon: Briefcase,
    badge: "Designers & Tech",
    accent: "from-emerald-500/10 to-teal-500/5",
    color: "text-emerald-600",
  },
  {
    id: "bio",
    category: "link_in_bio",
    title: "Link in Bio",
    desc: "Turn one social link into your complete digital presence.",
    subtext: "Multiple links, featured media, direct WhatsApp & newsletter.",
    subdomain: "sarah.okinsite.com",
    icon: Share2,
    badge: "Social Hub",
    accent: "from-cyan-500/10 to-sky-500/5",
    color: "text-cyan-600",
  },
  {
    id: "restaurant",
    category: "restaurant_menu",
    title: "Restaurant",
    desc: "Share your menu, location, contact, and reservations.",
    subtext: "Interactive digital menu, QR code access, hours & map pin.",
    subdomain: "lumina.okinsite.com",
    icon: Utensils,
    badge: "Food & Hospitality",
    accent: "from-amber-500/10 to-orange-500/5",
    color: "text-amber-600",
  },
  {
    id: "personal",
    category: "personal",
    title: "Personal Brand",
    desc: "Build a home for your name, work, and story.",
    subtext: "About you, achievements, speaking, essays & contact point.",
    subdomain: "elena.okinsite.com",
    icon: User,
    badge: "Founders & Leaders",
    accent: "from-indigo-500/10 to-blue-500/5",
    color: "text-indigo-600",
  },
  {
    id: "product",
    category: "product_landing",
    title: "Product & Startup",
    desc: "Launch your product, collect leads, and build momentum.",
    subtext: "Feature highlights, early access waitlist, pricing & demo.",
    subdomain: "flow.okinsite.com",
    icon: ShoppingBag,
    badge: "Launches & SaaS",
    accent: "from-rose-500/10 to-pink-500/5",
    color: "text-rose-600",
  },
  {
    id: "resume",
    category: "resume",
    title: "Resume & CV",
    desc: "Turn your CV into a professional online profile.",
    subtext: "Interactive career timeline, verified skills & PDF export.",
    subdomain: "jordan.okinsite.com",
    icon: FileText,
    badge: "Career Ready",
    accent: "from-slate-500/10 to-zinc-500/5",
    color: "text-slate-700",
  },
];

// ── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      "I replaced four different tools with one OkiNSITE address. Clients get my portfolio, availability, and booking link without any clutter.",
    name: "Elena Rostova",
    role: "Brand Identity Designer",
    siteUrl: "elena.okinsite.com",
    avatar: "ER",
  },
  {
    quote:
      "Our cafe needed a clean menu QR code that customers could open in one second without downloading an app. Setup took literally 3 minutes.",
    name: "Marco Silva",
    role: "Founder, Café Lumina",
    siteUrl: "cafelumina.okinsite.com",
    avatar: "MS",
  },
  {
    quote:
      "Social algorithms come and go. Having my own clean web address where my audience can always reach my newsletters and courses is invaluable.",
    name: "Tariq Vance",
    role: "Tech Creator & Writer",
    siteUrl: "tariqvance.okinsite.com",
    avatar: "TV",
  },
  {
    quote:
      "As an independent consultant, I didn’t need an expensive 10-page website. OkiNSITE gave me a credible online home that converts new inquiries.",
    name: "Samantha Reed",
    role: "Operations Consultant",
    siteUrl: "samanthareed.okinsite.com",
    avatar: "SR",
  },
];

// ── FAQ Items for Humans & AI Search Crawlers ────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "What is OkiNSITE?",
    a: "OkiNSITE is a modern digital presence platform that gives creators, freelancers, businesses, and restaurants their own professional web destination with a free custom subdomain like yourname.okinsite.com. Unlike complicated website builders or limited link-in-bio tools, OkiNSITE provides a complete, fast, mobile-friendly online home in under 3 minutes with zero coding or server setup.",
  },
  {
    q: "How do I claim my free yourname.okinsite.com address?",
    a: "Simply type your chosen name into the subdomain checker on this page. If available, click 'Claim My Free Site' to select a template, personalize your details, and publish live instantly. Your address is reserved exclusively for you.",
  },
  {
    q: "Is OkiNSITE really free forever?",
    a: "Yes. Early users receive free hosting, automatic SSL security certificates, mobile responsiveness, and global CDN delivery with no credit card required and no hidden setup fees.",
  },
  {
    q: "How does OkiNSITE differ from a traditional website builder or Linktree?",
    a: "A link-in-bio gives you a basic list of buttons with zero brand depth. Traditional website builders (like WordPress or Webflow) are expensive, steep in complexity, and require hours of setup. OkiNSITE provides the sweet spot: a rich, credible, multi-section digital presence that takes only 3 minutes to publish.",
  },
  {
    q: "Do I need any coding knowledge or hosting configuration?",
    a: "Zero coding or server knowledge is required. You edit text, photos, and links directly on a visual canvas. When you click 'Publish', OkiNSITE handles the global CDN, SSL certificates, caching, and mobile layout automatically.",
  },
  {
    q: "Can I use OkiNSITE for businesses, portfolios, and restaurants?",
    a: "Yes. OkiNSITE features purpose-built digital presence archetypes including Local Businesses (services & inquiry forms), Portfolios (case studies & galleries), Creators (video highlights & media kits), Restaurants (digital QR menus), and Products (lead capture & waitlists).",
  },
];

// ── Template Categories Filter ───────────────────────────────────────────────
const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "business", label: "Business" },
  { id: "creator", label: "Creator" },
  { id: "portfolio", label: "Portfolio" },
  { id: "restaurant_menu", label: "Restaurant" },
  { id: "personal", label: "Personal" },
  { id: "product_landing", label: "Product" },
  { id: "link_in_bio", label: "Bio" },
];

export default function LandingPage() {
  const router = useRouter();

  const [usernameInput, setUsernameInput] = useState("");
  const [bottomUsernameInput, setBottomUsernameInput] = useState("");
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState("all");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const [activeHeroTab, setActiveHeroTab] = useState<"velora" | "gym" | "bio">("velora");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Fetch templates for live showcase
  useEffect(() => {
    templatesApi
      .list()
      .then((res) => {
        const data = res?.data || [];
        if (Array.isArray(data)) setDbTemplates(data);
      })
      .catch(() => {});
  }, []);

  const cleanSlug =
    (usernameInput || bottomUsernameInput)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "yourname";

  const isAvailable = cleanSlug.length >= 2;

  const displayName =
    cleanSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Your Name";

  const handleClaim = (targetUsername?: string) => {
    if (targetUsername) {
      setUsernameInput(targetUsername);
    }
    setIsModalOpen(true);
  };

  const launchEditor = async (templateId: string | null, profile?: BusinessProfile | null) => {
    setIsRedirecting(true);
    try {
      let customConfig: any;
      const tpl = templateId
        ? dbTemplates.find((t) => t._id === templateId || t.slug === templateId || t.id === templateId)
        : null;

      const effectiveName = profile?.brandName?.trim() || displayName;

      if (tpl) {
        const rawConfig = tpl.defaultConfig || tpl.config || {};
        customConfig = JSON.parse(JSON.stringify(rawConfig));
        if (customConfig.meta) customConfig.meta.title = effectiveName;
        const s0 = customConfig.sections?.[0];
        if (s0?.content) {
          if (s0.content.title) s0.content.title = effectiveName;
          if (s0.content.name) s0.content.name = effectiveName;
        }
      } else {
        customConfig = {
          meta: {
            title: effectiveName,
            category: profile?.category || "portfolio",
            description: profile?.tagline || "Digital Presence",
          },
          theme: {
            primaryColor: "#2563EB",
            backgroundColor: "#0F172A",
            textColor: "#F8FAFC",
            fontFamily: "Inter",
            borderRadius: "16px",
          },
          sections: [
            {
              id: "hero-1",
              type: "hero",
              title: effectiveName,
              subtitle: profile?.tagline || "Welcome to my official digital presence.",
              badge: "Digital Presence",
              content: { ctaText: profile?.ctaText || "Get In Touch", ctaLink: "#contact" },
            },
            {
              id: "contact-1",
              type: "contact",
              title: "Get in Touch",
              subtitle: "Send a direct message or connect with me.",
              content: {
                phone: profile?.phone || "",
                whatsapp: profile?.whatsapp || profile?.phone || "",
                email: profile?.email || "",
                address: profile?.location || "",
                formConfig: {
                  enabled: true,
                  destination: "both",
                  whatsappNumber: profile?.whatsapp || profile?.phone || "",
                  notifyEmail: profile?.email || "",
                },
              },
            },
          ],
        };
      }

      if (profile) {
        customConfig = injectBusinessProfileIntoConfig(customConfig, profile);
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (token) {
        const res = await projectsApi.create({
          name: effectiveName,
          category: (profile?.category ?? tpl?.category ?? "portfolio") as any,
          config: customConfig,
        });
        if (res.data?._id) {
          try {
            sessionStorage.setItem(`Oninsite-pending-project:${res.data._id}`, JSON.stringify(res.data));
          } catch {
            /* ignore quota */
          }
          router.push(`/editor/${res.data._id}`);
          return;
        }
      }

      sessionStorage.setItem(
        "Oninsite-quick-start-draft",
        JSON.stringify({
          name: effectiveName,
          slug: cleanSlug,
          category: profile?.category ?? tpl?.category ?? "portfolio",
          config: customConfig,
        })
      );
      router.push("/editor/quick-start");
    } catch (err) {
      console.error(err);
      router.push("/templates");
    } finally {
      setIsRedirecting(false);
    }
  };

  // Filter templates for showcase
  const displayedTemplates = dbTemplates
    .filter((t) => {
      if (selectedTemplateCategory === "all") return true;
      const cat = (t.category || "").toLowerCase();
      return cat.includes(selectedTemplateCategory);
    })
    .slice(0, 6);

  // Active Hero Configuration & Subdomain
  // Merge customCode from DB template (sits at tpl root, not inside defaultConfig)
  // so CSS animations (vlAura, vlGoldText, gymPulse etc.) are always injected.
  const _mkHeroConfig = (tpl: any, fallback: any) => {
    if (!tpl) return fallback;
    const base = tpl.defaultConfig || tpl.config || fallback;
    const dbCustomCode = tpl.customCode || tpl.defaultConfig?.customCode;
    if (!dbCustomCode) return base;
    return { ...base, customCode: dbCustomCode };
  };
  const activeHeroConfig =
    activeHeroTab === "velora"
      ? _mkHeroConfig(dbTemplates.find((t) => (t.slug || "").includes("velora")), VELORA_SALON_CONFIG)
      : activeHeroTab === "gym"
      ? _mkHeroConfig(dbTemplates.find((t) => (t.slug || "").includes("stronger") || (t.slug || "").includes("fitness")), GYM_BOLD_CONFIG)
      : _mkHeroConfig(dbTemplates.find((t) => (t.category || "").includes("link_in_bio")), LINK_IN_BIO_CONFIG);

  const activeHeroName =
    activeHeroTab === "velora"
      ? "Velora Salon & Spa"
      : activeHeroTab === "gym"
      ? "Iron Forge Gym"
      : "Alex Rivera Bio";

  const activeHeroCategory =
    activeHeroTab === "velora"
      ? "business"
      : activeHeroTab === "gym"
      ? "business"
      : "link_in_bio";

  const activeHeroSubdomain =
    usernameInput.trim().length >= 2
      ? `${cleanSlug}.okinsite.com`
      : activeHeroTab === "velora"
      ? "velorasalon.okinsite.com"
      : activeHeroTab === "gym"
      ? "gymbold.okinsite.com"
      : "bio.okinsite.com";

  // ── JSON-LD Structured Data for Google, Bing & AI Search Engines ─────────────
  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://okinsite.com/#website",
        url: "https://okinsite.com",
        name: "OkiNSITE",
        description: "Claim your place on the internet with a free custom web address like yourname.okinsite.com",
        publisher: {
          "@type": "Organization",
          name: "OkiNSITE",
          url: "https://okinsite.com",
          logo: {
            "@type": "ImageObject",
            url: "https://res.cloudinary.com/usj348ny/image/upload/v1788452134/okinsite.png",
          },
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://okinsite.com/#software",
        name: "OkiNSITE",
        applicationCategory: "BusinessApplication",
        operatingSystem: "All",
        url: "https://okinsite.com",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        description:
          "Digital presence platform allowing users to claim free subdomains (yourname.okinsite.com) and publish professional websites for creators, businesses, restaurants, and personal brands in 3 minutes.",
      },
      {
        "@type": "FAQPage",
        "@id": "https://okinsite.com/#faq",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen selection:bg-blue-100 selection:text-blue-900 font-sans antialiased overflow-x-hidden">
      {/* ── Keyframe Animations for Up-and-Down Preview Scroll ── */}
      <style>{`
        @keyframes heroPreviewScroll {
          0%        { transform: translateY(0%); animation-timing-function: cubic-bezier(0.55, 0, 0.45, 1); }
          10%       { transform: translateY(-28%); animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1); }
          28%, 42%  { transform: translateY(-30%); animation-timing-function: cubic-bezier(0.55, 0, 0.45, 1); }
          52%       { transform: translateY(-70%); animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1); }
          65%, 76%  { transform: translateY(-72%); animation-timing-function: cubic-bezier(0.55, 0, 0.45, 1); }
          88%       { transform: translateY(0%); animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1); }
          100%      { transform: translateY(0%); }
        }
        .animate-hero-scroll {
          animation: heroPreviewScroll 22s linear infinite;
        }
        .animate-hero-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ── JSON-LD Structured Data Injection ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* ── Hidden Semantic Content for AI Crawlers & Assistive Tech ── */}
      <div className="sr-only">
        <h2>OkiNSITE — Free Custom Subdomain Digital Presence Platform (okinsite.com)</h2>
        <p>
          Claim your free custom web address like yourname.okinsite.com. Create a high-converting, professional online presence for your business, creator brand, portfolio, link in bio, or restaurant. Powered by global CDN, automatic SSL encryption, and fast visual editing.
        </p>
      </div>

      {/* ── 1. HEADER (Clean Sticky SaaS Navigation) ── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[70px] flex items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="https://res.cloudinary.com/usj348ny/image/upload/v1788452134/okinsite.png"
              alt="OkiNSITE"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Center: Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition-colors">
              How It Works
            </a>
            <Link href="/templates" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition-colors">
              Templates
            </Link>
            <a href="#presence-types" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition-colors">
              For Creators
            </a>
            <a href="#presence-types" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition-colors">
              For Businesses
            </a>
            <a href="#pricing" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition-colors inline-flex items-center gap-1.5">
              <span>Pricing</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200/60">
                Free now
              </span>
            </a>
            <a href="#value-prop" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition-colors">
              Why OkiNSITE
            </a>
            <a href="#faq" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => handleClaim()}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 transition-all"
            >
              <span>Claim Your Free Site</span>
              <ArrowRight size={15} />
            </button>
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xl p-5 flex flex-col gap-2 z-50 animate-in slide-in-from-top-2 duration-150">
            <a
              href="#how-it-works"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </a>
            <Link
              href="/templates"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Templates
            </Link>
            <a
              href="#presence-types"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              For Creators & Businesses
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Pricing</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                Free for early users
              </span>
            </a>
            <a
              href="#value-prop"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Why OkiNSITE
            </a>
            <a
              href="#faq"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              FAQ
            </a>
            <div className="pt-3 mt-1 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileNavOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  handleClaim();
                }}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <span>Claim Your Free Site</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ── 2. HERO SECTION ── */}
        <section className="relative pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 overflow-hidden border-b border-slate-200/60">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
            <div className="absolute top-0 left-1/4 w-[520px] h-[320px] bg-gradient-to-tr from-blue-100/50 via-indigo-50/40 to-transparent blur-3xl opacity-70" />
            <div className="absolute top-20 right-10 w-[440px] h-[340px] bg-gradient-to-br from-sky-100/40 via-blue-50/30 to-transparent blur-3xl opacity-60" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Positioning & Custom Subdomain Claim Component */}
              <div className="lg:col-span-6 space-y-6 sm:space-y-8">
                {/* Micro badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/70 text-blue-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>Your place on the internet</span>
                </div>

                {/* Primary H1 */}
                <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight text-slate-950 leading-[1.08]">
                  Claim your place <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                    on the internet.
                  </span>
                </h1>

                {/* Supporting Copy */}
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                  Create a professional online presence for your business, portfolio, creator brand, restaurant, product, or personal brand — and publish it in minutes.
                </p>

                {/* ── CUSTOM SUBDOMAIN CLAIM CARD (Signature conversion component: abc.okinsite.com) ── */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-5 sm:p-6 space-y-4 max-w-xl transition-all hover:border-slate-300">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Claim your free OkiNSITE address
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                      Free Forever
                    </span>
                  </div>

                  {/* Subdomain Input Widget: [yourname] .okinsite.com */}
                  <div className="space-y-2">
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 sm:px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                      <span className="text-xs sm:text-sm font-semibold text-slate-400 font-mono select-none pr-1.5">
                        https://
                      </span>
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && isAvailable) handleClaim(usernameInput);
                        }}
                        placeholder="yourname"
                        aria-label="Choose your custom subdomain"
                        className="flex-1 bg-transparent text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none placeholder-slate-300 min-w-0"
                      />
                      <span className="text-xs sm:text-sm font-bold text-blue-600 font-mono select-none px-1">
                        .okinsite.com
                      </span>
                      <div className="shrink-0 pl-2">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Check size={12} className="stroke-[3]" />
                            <span className="hidden sm:inline">Available</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">choose name</span>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Availability Status Indicator */}
                    <div className="flex items-center justify-between text-[11px] px-1">
                      {isAvailable ? (
                        <p className="text-emerald-700 font-medium flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <span><strong>{cleanSlug}.okinsite.com</strong> is ready to claim.</span>
                        </p>
                      ) : (
                        <p className="text-slate-400">
                          Type your personal name, project, or business to see live availability.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Main Primary Action CTA */}
                  <button
                    onClick={() => handleClaim(usernameInput)}
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    <span>Claim My Free Site</span>
                    <ArrowRight size={17} />
                  </button>

                  {/* Trust guarantees under CTA */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-1.5 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Check size={12} className="text-emerald-600" /> Free forever
                    </span>
                    <span className="flex items-center gap-1">
                      <Check size={12} className="text-emerald-600" /> Free hosting
                    </span>
                    <span className="flex items-center gap-1">
                      <Check size={12} className="text-emerald-600" /> SSL included
                    </span>
                    <span className="flex items-center gap-1">
                      <Check size={12} className="text-emerald-600" /> No credit card
                    </span>
                  </div>

                  {/* Secondary fallback */}
                  <div className="text-center pt-1">
                    <Link
                      href="/login"
                      className="text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors"
                    >
                      Already have a site? <span className="underline font-semibold">Sign in</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Previews (Real Up-and-Down Scrolling Live Template Preview) */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* Floating Trust Labels */}
                  <div className="absolute -top-4 right-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-md text-xs font-bold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Worldwide</span>
                  </div>

                  <div className="absolute -bottom-3 left-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-md text-xs font-semibold text-slate-700">
                    <ShieldCheck size={14} className="text-blue-600" />
                    <span>SSL Secured · Edge CDN</span>
                  </div>

                  {/* Browser Window Mockup with Real Animated Scroll Preview */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden">
                    {/* Browser Chrome Header */}
                    <div className="bg-slate-900 text-white px-4 sm:px-5 py-3 flex items-center justify-between border-b border-slate-800 gap-3">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>

                      {/* Browser Address Bar: https://[subdomain].okinsite.com */}
                      <div className="flex-1 max-w-sm mx-auto bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1 text-center flex items-center justify-center gap-1.5">
                        <Lock size={11} className="text-emerald-400 shrink-0" />
                        <span className="text-[11px] font-mono text-slate-200 font-semibold truncate">
                          https://{activeHeroSubdomain}
                        </span>
                      </div>

                      <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md shrink-0">
                        <span>● Live</span>
                      </div>
                    </div>

                    {/* Interactive Real Template Switcher Tabs (Velora Salon, Gym Bold, Link in Bio) */}
                    <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveHeroTab("velora")}
                          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                            activeHeroTab === "velora"
                              ? "bg-white text-emerald-800 shadow-xs border border-emerald-200/80"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <Sparkles size={13} className="text-amber-500" />
                          <span>Velora Salon</span>
                        </button>
                        <button
                          onClick={() => setActiveHeroTab("gym")}
                          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                            activeHeroTab === "gym"
                              ? "bg-white text-orange-600 shadow-xs border border-orange-200/80"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <Activity size={13} className="text-orange-500" />
                          <span>Gym Bold</span>
                        </button>
                        <button
                          onClick={() => setActiveHeroTab("bio")}
                          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                            activeHeroTab === "bio"
                              ? "bg-white text-cyan-700 shadow-xs border border-cyan-200/80"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <Share2 size={13} className="text-cyan-600" />
                          <span>Link in Bio</span>
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                        Auto-gliding preview
                      </span>
                    </div>

                    {/* Moving Up and Down Real Template Preview Window */}
                    <div className="relative h-[480px] sm:h-[560px] bg-slate-950 overflow-hidden group">
                      {/* Vertically animated scrolling viewport wrapper */}
                      <div className="w-full animate-hero-scroll will-change-transform">
                        <TemplateThumbnail
                          config={activeHeroConfig}
                          name={activeHeroName}
                          category={activeHeroCategory}
                          height={1400}
                        />
                      </div>

                      {/* Top subtle vignette */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-950/40 to-transparent" />

                      {/* Bottom action banner & hover-to-pause indicator */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-end justify-between px-4 pb-3">
                        <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Scrolling preview · Hover to pause</span>
                        </div>
                        <button
                          onClick={() => handleClaim(cleanSlug)}
                          className="pointer-events-auto px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
                        >
                          Claim This Design →
                        </button>
                      </div>
                    </div>

                    {/* Footer inside preview box */}
                    <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Live on your custom address: <strong className="font-mono text-slate-800">{activeHeroSubdomain}</strong>
                      </span>
                      <button
                        onClick={() => handleClaim(activeHeroTab === "velora" ? "velora-salon-spa" : activeHeroTab === "gym" ? "stronger-studio-fitness-coach" : "kai-chen-bio")}
                        className="font-bold text-blue-600 hover:underline text-[11px]"
                      >
                        Customize This Template →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. SOCIAL PROOF / TRUST STRIP ── */}
        <section aria-label="Presence types supported" className="py-8 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5">
              Built for every kind of online presence
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-semibold text-slate-700">
              {[
                { label: "Business", icon: Store },
                { label: "Creator", icon: Palette },
                { label: "Portfolio", icon: Briefcase },
                { label: "Link in Bio", icon: Share2 },
                { label: "Restaurant", icon: Utensils },
                { label: "Personal Brand", icon: User },
                { label: "Product", icon: ShoppingBag },
                { label: "Resume", icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/70 transition-colors"
                  >
                    <Icon size={14} className="text-blue-600" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 5. VALUE PROPOSITION: One link. Your entire presence. ── */}
        <section id="value-prop" className="py-20 sm:py-28 bg-[#FAFBFD] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full">
                The Shift in Online Presence
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                One link. <br />
                <span className="text-slate-500">Your entire presence.</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Your social profile is not your website. Your website doesn&apos;t need to be complicated. OkiNSITE gives you one simple place to show who you are, what you do, and how people can connect with you.
              </p>
            </div>

            {/* 3-Column Visual Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Old 1: Social Profile */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    01 · The Social Profile
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Scattered & rented</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Locked inside proprietary feeds. The algorithm controls who sees your work, and you get a single plain link field that leads nowhere.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-rose-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Zero ownership of audience</span>
                </div>
              </div>

              {/* Old 2: Traditional Website */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    02 · Traditional Builders
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Complicated & expensive</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Dozens of confusing toolbars, hosting fees, DNS records, plugin updates, and weeks of design tinkering before anything goes live.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>High friction to launch</span>
                </div>
              </div>

              {/* New: OkiNSITE Presence */}
              <div className="bg-blue-600 text-white rounded-2xl border border-blue-500 p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl shadow-blue-600/15">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-200">
                    03 · OkiNSITE Presence
                  </div>
                  <h3 className="text-lg font-bold text-white">One complete destination</h3>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Claim your free custom subdomain in 10 seconds. Edit visually. Publish with one click. Everything stays fast, mobile-friendly, and completely yours.
                  </p>
                </div>
                <div className="pt-4 border-t border-blue-500/60 flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 size={15} className="text-blue-200" />
                  <span>Live on yourname.okinsite.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. HOW IT WORKS: From idea to live in 3 simple steps ── */}
        <section id="how-it-works" className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Simple Execution
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                From idea to live in 3 simple steps.
              </h2>
              <p className="text-slate-600 text-base">
                No server setup. No DNS configuration. No technical hurdles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 01 */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-7 flex flex-col justify-between space-y-6 hover:bg-white hover:border-slate-300 transition-all">
                <div className="space-y-3">
                  <div className="text-3xl font-black font-mono text-blue-600">01</div>
                  <h3 className="text-xl font-bold text-slate-950">CLAIM</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Choose your free web address. Claim your custom subdomain before someone else does.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 flex items-center justify-between">
                  <span>{cleanSlug}.okinsite.com</span>
                  <Check size={14} className="text-emerald-500 stroke-[3]" />
                </div>
              </div>

              {/* Step 02 */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-7 flex flex-col justify-between space-y-6 hover:bg-white hover:border-slate-300 transition-all">
                <div className="space-y-3">
                  <div className="text-3xl font-black font-mono text-indigo-600">02</div>
                  <h3 className="text-xl font-bold text-slate-950">CREATE</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Choose a design and customize your presence. Click any element on the visual canvas to edit text, links, photos, and colors.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-semibold text-indigo-700 flex items-center justify-between">
                  <span>Template → Edit → Preview</span>
                  <Sliders size={14} className="text-indigo-500" />
                </div>
              </div>

              {/* Step 03 */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-7 flex flex-col justify-between space-y-6 hover:bg-white hover:border-slate-300 transition-all">
                <div className="space-y-3">
                  <div className="text-3xl font-black font-mono text-emerald-600">03</div>
                  <h3 className="text-xl font-bold text-slate-950">PUBLISH</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Go live instantly. OkiNSITE handles hosting, global CDN speed, SSL encryption, and mobile responsiveness automatically.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 flex items-center justify-between">
                  <span>Published ✓ Worldwide</span>
                  <Globe size={14} className="text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. PRESENCE TYPES: Whatever you're building, give it a home ── */}
        <section id="presence-types" className="py-20 sm:py-28 bg-[#FAFBFD] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full">
                Tailored Solutions
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Whatever you&apos;re building, give it a home.
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Start with a presence designed for what you do.
              </p>
            </div>

            {/* 8-Card Interactive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {PRESENCE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleClaim(item.id)}
                    className="group bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon size={20} className={item.color} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.badge}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-blue-600 font-semibold mb-1">
                          {item.subdomain}
                        </div>
                        <h3 className="text-lg font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-2 font-medium">
                          {item.subtext}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-blue-600">
                      <span>Create {item.title}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 8. TEMPLATE SHOWCASE: Start with a look that already feels right ── */}
        <section id="templates-showcase" className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full">
                  Editorial Starting Points
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Start with a look that already feels right.
                </h2>
                <p className="text-slate-600 text-base">
                  Choose a professionally designed starting point. Make it yours. Publish when you&apos;re ready.
                </p>
              </div>

              <Link
                href="/templates"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
              >
                <span>Explore all templates</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedTemplateCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedTemplateCategory === cat.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayedTemplates.length > 0 ? (
                displayedTemplates.map((tpl) => (
                  <div
                    key={tpl._id || tpl.id || tpl.slug}
                    onClick={() => handleClaim(tpl.slug)}
                    className="group rounded-2xl border border-slate-200/90 bg-[#FAFBFD] overflow-hidden hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-200/80">
                      <TemplateThumbnail
                        config={tpl.defaultConfig || tpl.config}
                        name={tpl.name}
                        category={tpl.category}
                      />
                      <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-lg">
                          Use This Template →
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-blue-600 font-semibold mb-0.5">
                          {tpl.slug}.okinsite.com
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {tpl.name}
                        </h3>
                        <p className="text-xs text-slate-500 capitalize">{tpl.category?.replace(/_/g, " ") || "Presence"}</p>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                        Claim & Edit →
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                /* Fallback Editorial Placeholders if templates are still loading */
                [
                  { name: "Velora Salon & Spa", cat: "Business", desc: "Emerald & gold luxury wellness aesthetics", sub: "velorasalon.okinsite.com" },
                  { name: "Iron Forge Gym", cat: "Business", desc: "Bold athletic coaching and membership pricing", sub: "gymbold.okinsite.com" },
                  { name: "Alex Rivera Bio", cat: "Creator", desc: "Clean developer link hub & newsletter", sub: "bio.okinsite.com" },
                ].map((ph, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleClaim()}
                    className="rounded-2xl border border-slate-200 p-6 bg-slate-50/60 flex flex-col justify-between space-y-8 cursor-pointer hover:bg-white transition-all"
                  >
                    <div className="aspect-[16/10] rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-mono text-xs">
                      [Live Preview: {ph.sub}]
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{ph.cat}</span>
                      <h3 className="text-base font-bold text-slate-900">{ph.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{ph.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── 9. PRODUCT EXPERIENCE: Edit visually. Publish instantly. ── */}
        <section className="py-20 sm:py-28 bg-[#FAFBFD] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full">
                Zero Learning Curve
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Edit visually. <br />
                <span className="text-slate-500">Publish instantly.</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                No coding. No confusing settings. No learning curve.
              </p>
            </div>

            {/* Realistic OkiNSITE Visual Editor Interface Representation */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/5 overflow-hidden">
              {/* Editor Top Bar */}
              <div className="h-12 bg-slate-900 text-white px-4 sm:px-6 flex items-center justify-between text-xs border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-slate-400 pl-2 hidden sm:inline">
                    {cleanSlug}.okinsite.com
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <Check size={12} /> Auto-saved
                  </span>
                  <button
                    onClick={() => handleClaim()}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                  >
                    <span>Go Live</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Editor Split Canvas & Inspector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
                {/* Left: Website Canvas */}
                <div className="lg:col-span-8 p-6 sm:p-10 bg-slate-50/50 flex flex-col justify-center items-center border-b lg:border-b-0 lg:border-r border-slate-200/80">
                  <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 space-y-4 relative">
                    <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                      Live Canvas
                    </div>
                    <div className="p-2.5 rounded-xl border border-dashed border-blue-400 bg-blue-50/40 relative">
                      <span className="text-[10px] font-mono text-blue-600 absolute -top-2 left-2 bg-white px-1 font-bold">
                        Click text to edit
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">{displayName}</h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Designing products, writing articles, and building for the modern web.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700">
                        View Projects
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-medium text-slate-700">
                        Book a Call
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>Click text</span> → <span>Edit</span> → <span>Preview</span> → <span>Publish</span>
                  </div>
                </div>

                {/* Right: Clean Inspector Settings */}
                <div className="lg:col-span-4 p-6 sm:p-8 bg-white space-y-5">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Quick Customization
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 border border-slate-200 ring-2 ring-blue-600/20" />
                        <div className="w-6 h-6 rounded-full bg-violet-600 border border-slate-200" />
                        <div className="w-6 h-6 rounded-full bg-emerald-600 border border-slate-200" />
                        <div className="w-6 h-6 rounded-full bg-amber-500 border border-slate-200" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Typography
                      </label>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                        Inter · Modern Geometric
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Subdomain Address
                      </label>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 flex items-center justify-between">
                        <span>{cleanSlug}.okinsite.com</span>
                        <Check size={14} className="text-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Contact Form
                      </label>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                        <span>Direct to WhatsApp & Email</span>
                        <Check size={14} className="text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaim()}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                  >
                    Try Editor Free →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 10. OWN YOUR PRESENCE: Don't build your audience on rented land ── */}
        <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
              {/* Subtle orb */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-6 max-w-2xl">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full">
                  Audience Ownership
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Don&apos;t build your audience on rented land.
                </h2>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                  Social platforms can change. Algorithms can change. Your OkiNSITE address is yours to share everywhere.
                </p>

                {/* Visual connecting channels to single address */}
                <div className="pt-4 pb-2">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-300">
                    <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1.5">
                      <Instagram size={13} /> Instagram
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1.5">
                      <Youtube size={13} /> YouTube
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1.5">
                      <Linkedin size={13} /> LinkedIn
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1.5">
                      <QrCode size={13} /> QR Code
                    </span>
                    <span className="text-blue-400 font-bold">→</span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-mono font-bold shadow">
                      {cleanSlug}.okinsite.com
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleClaim()}
                    className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all inline-flex items-center gap-2 shadow-lg"
                  >
                    <span>Claim Your Address</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 11. BUILT-IN INFRASTRUCTURE: Everything you need to stay live ── */}
        <section className="py-20 sm:py-28 bg-[#FAFBFD] border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Zero Maintenance
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Everything you need to stay live.
              </h2>
              <p className="text-slate-600 text-base">
                You focus on your presence. OkiNSITE handles the infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {[
                { title: "Free Subdomain", desc: "Your unique address like yourname.okinsite.com", icon: Globe },
                { title: "Free Hosting", desc: "Reliable edge hosting with 99.9% uptime", icon: Server },
                { title: "Fast Delivery", desc: "Instant global content distribution", icon: Zap },
                { title: "SSL Security", desc: "Automatic HTTPS encryption included", icon: Lock },
                { title: "Mobile Responsive", desc: "Engineered for phone, tablet, & desktop", icon: Smartphone },
                { title: "SEO Ready", desc: "Search engine friendly structure & meta tags", icon: Search },
                { title: "1-Click Publishing", desc: "Instant deployment with zero build waiting", icon: Send },
                { title: "No Server Setup", desc: "Never touch DNS, FTP, or server configs", icon: ShieldCheck },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 12. SEO SECTION: Your website should be easy to find ── */}
        <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full">
                  Search Engine Visibility
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Your website should be easy to find.
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  OkiNSITE helps you create a fast, mobile-friendly online presence with the essential foundation for search engines and AI assistants.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleClaim()}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Start with SEO-ready presence</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-6 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Included SEO & AI Foundation
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
                    {[
                      "Custom page title & OpenGraph",
                      "Meta descriptions & keywords",
                      "Clean subdomain URLs",
                      "Fast-loading Core Web Vitals",
                      "Structured JSON-LD schema",
                      "Mobile responsive layouts",
                      "Social sharing previews",
                      "Free SSL HTTPS certificate",
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5"
                      >
                        <Check size={14} className="text-blue-600 shrink-0 font-bold" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 13. FAQ SECTION (Designed for Human Trust & AI Search Crawlers) ── */}
        <section id="faq" aria-labelledby="faq-heading" className="py-20 sm:py-28 bg-[#FAFBFD] border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Clear Answers
              </span>
              <h2 id="faq-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 text-sm">
                Everything you need to know about claiming your OkiNSITE digital presence.
              </p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-bold text-slate-900">
                        {item.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 14. SOCIAL PROOF / TESTIMONIALS ── */}
        <section aria-label="Customer testimonials" className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Real Stories
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Trusted by creators, founders, and local businesses.
              </h2>
              <p className="text-slate-500 text-sm">
                Authentic presences live on OkiNSITE.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
                >
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {t.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{t.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{t.role}</div>
                      <div className="text-[10px] font-mono text-blue-600 truncate">{t.siteUrl}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 15. STRONG FINAL CTA SECTION (With Custom Subdomain Claim) ── */}
        <section id="pricing" className="py-20 sm:py-28 bg-white relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full">
                Early Access · Free
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                Your name deserves a place online.
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                Claim your free custom web address and create your digital presence in minutes.
              </p>
            </div>

            {/* Repeated Signature Custom Subdomain Claim Interaction */}
            <div className="max-w-xl mx-auto bg-slate-50/80 p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xl space-y-4">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 sm:px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 font-mono select-none pr-1.5">
                  https://
                </span>
                <input
                  type="text"
                  value={bottomUsernameInput}
                  onChange={(e) => setBottomUsernameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleClaim(bottomUsernameInput);
                  }}
                  placeholder="yourname"
                  aria-label="Choose your address"
                  className="flex-1 bg-transparent text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none placeholder-slate-300 min-w-0"
                />
                <span className="text-xs sm:text-sm font-bold text-blue-600 font-mono select-none px-1">
                  .okinsite.com
                </span>
              </div>

              <button
                onClick={() => handleClaim(bottomUsernameInput || usernameInput)}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
              >
                <span>Claim My Free Site</span>
                <ArrowRight size={17} />
              </button>

              <p className="text-xs text-slate-500 font-medium pt-1">
                Free forever · No credit card · Go live in minutes
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── 16. FOOTER (Clean Premium SaaS Footer) ── */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Col 1: Brand */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="inline-block">
                <img
                  src="https://res.cloudinary.com/usj348ny/image/upload/v1788452134/okinsite.png"
                  alt="OkiNSITE"
                  className="h-8 w-auto object-contain brightness-0 invert opacity-90"
                />
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Your place on the internet. A simple digital presence platform for creators, freelancers, businesses, restaurants, and personal brands.
              </p>
              <div className="text-xs text-slate-500">
                Claim your web address: <span className="text-blue-400 font-mono">yourname.okinsite.com</span>
              </div>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Product</div>
              <ul className="space-y-2">
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#value-prop" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><span className="text-slate-600">Changelog (v1.5)</span></li>
              </ul>
            </div>

            {/* Col 3: Use Cases */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Use Cases</div>
              <ul className="space-y-2">
                <li><a href="#presence-types" className="hover:text-white transition-colors">Business (apex.okinsite.com)</a></li>
                <li><a href="#presence-types" className="hover:text-white transition-colors">Creator (maya.okinsite.com)</a></li>
                <li><a href="#presence-types" className="hover:text-white transition-colors">Portfolio (alex.okinsite.com)</a></li>
                <li><a href="#presence-types" className="hover:text-white transition-colors">Restaurant (lumina.okinsite.com)</a></li>
                <li><a href="#presence-types" className="hover:text-white transition-colors">Link in Bio</a></li>
                <li><a href="#presence-types" className="hover:text-white transition-colors">Personal Brand</a></li>
              </ul>
            </div>

            {/* Col 4: Resources & Company */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Resources</div>
              <ul className="space-y-2">
                <li><Link href="/templates" className="hover:text-white transition-colors">Explore Gallery</Link></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ & Support</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><span className="text-slate-600">Privacy & Terms</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 OkiNSITE. All rights reserved.</p>
            <p className="font-mono text-[11px]">okinsite.com · Your place on the internet.</p>
          </div>
        </div>
      </footer>

      {/* ── Sticky Bottom CTA on Mobile ── */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 flex items-center justify-between gap-3 shadow-2xl safe-bottom">
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-slate-900 truncate">Claim your free address</div>
          <div className="text-[10px] font-mono text-blue-600 truncate">{cleanSlug}.okinsite.com</div>
        </div>
        <button
          onClick={() => handleClaim()}
          className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20"
        >
          Claim Free Site →
        </button>
      </div>

      {/* ── Site Creation Popup Modal ── */}
      <SiteCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        username={usernameInput || bottomUsernameInput || "my-brand"}
        onLaunch={(templateId, profile) => launchEditor(templateId, profile)}
        isRedirecting={isRedirecting}
      />
    </div>
  );
}
