import { writeFileSync } from "node:fs";

// ─── Velora Salon & Spa v2.0 — Premium Motion System ─────────────────────
// The CSS is written as a JS template literal. Serializing with JSON.stringify
// escapes the newlines to \n so the resulting .json is VALID JSON.
const CSS = `/* =========================================================
   VELORA SALON & SPA — PREMIUM MOTION SYSTEM
   Structured-section compatible
   ========================================================= */

body {
  --vl-gold: #C9A227;
  --vl-gold-light: #E7C9A9;
  --vl-emerald: #0B3B2E;
  --vl-emerald-2: #123F32;
  --vl-cream: #F7F3EA;
  --vl-white: #FFFDF8;
  --vl-muted: rgba(247,243,234,.68);
  --vl-border: rgba(201,162,39,.22);
  --vl-glow: rgba(201,162,39,.18);
  --vl-radius: 18px;
  --vl-ease: cubic-bezier(.16,1,.3,1);
}

body {
  overflow-x: hidden;
  background:
    radial-gradient(circle at 12% 8%, rgba(201,162,39,.12), transparent 28%),
    radial-gradient(circle at 88% 28%, rgba(231,201,169,.08), transparent 26%),
    linear-gradient(135deg, #071F18 0%, #0B3B2E 48%, #071F18 100%);
  color: var(--vl-cream);
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
  opacity: .035;
  background-image:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

body .navbar,
body nav {
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  background: linear-gradient(180deg, rgba(11,59,46,.88), rgba(11,59,46,.58));
  border-bottom: 1px solid rgba(201,162,39,.14);
  box-shadow: 0 10px 40px rgba(0,0,0,.16), inset 0 -1px 0 rgba(255,255,255,.03);
  transition: background .5s var(--vl-ease), box-shadow .5s var(--vl-ease), transform .5s var(--vl-ease);
}

body nav a { position: relative; transition: color .35s var(--vl-ease), transform .35s var(--vl-ease); }
body nav a:not(:has(button))::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -8px;
  width: 0;
  height: 1px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, var(--vl-gold), transparent);
  transition: width .4s var(--vl-ease);
}
body nav a:hover::after { width: 80%; }
body nav a:hover { color: var(--vl-gold-light); transform: translateY(-2px); }

body #hero {
  position: relative;
  isolation: isolate;
  min-height: 720px;
  overflow: hidden;
  background:
    radial-gradient(circle at 75% 35%, rgba(201,162,39,.16), transparent 30%),
    radial-gradient(circle at 10% 80%, rgba(231,201,169,.07), transparent 25%);
}
body #hero::before {
  content: "";
  position: absolute;
  width: 520px;
  height: 520px;
  right: -180px;
  top: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201,162,39,.18), rgba(201,162,39,.05) 35%, transparent 70%);
  filter: blur(8px);
  animation: vlAura 9s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: -1;
}
body #hero::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(120deg, transparent 35%, rgba(255,255,255,.025) 50%, transparent 65%);
  background-size: 220% 100%;
  animation: vlSweep 10s linear infinite;
}
@keyframes vlAura {
  0% { transform: scale(.85) translate3d(0,20px,0); opacity: .55; }
  100% { transform: scale(1.15) translate3d(-40px,-20px,0); opacity: 1; }
}
@keyframes vlSweep {
  0% { background-position: 180% 0; }
  100% { background-position: -40% 0; }
}
body #hero h1 {
  position: relative;
  letter-spacing: -.045em;
  line-height: .94;
  background: linear-gradient(105deg, #F7F3EA 5%, #E7C9A9 40%, #C9A227 65%, #FFF4CF 85%, #F7F3EA 100%);
  background-size: 250% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: vlGoldText 7s ease-in-out infinite alternate;
}
@keyframes vlGoldText {
  0% { background-position: 0% center; }
  100% { background-position: 100% center; }
}
body #hero [class*="badge"] {
  border: 1px solid rgba(201,162,39,.38);
  background: rgba(201,162,39,.08);
  box-shadow: 0 0 0 1px rgba(255,255,255,.025) inset, 0 10px 35px rgba(201,162,39,.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: vlBadgeFloat 5s ease-in-out infinite;
}
@keyframes vlBadgeFloat {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

body button,
body a[class*="button"],
body a[class*="Button"] {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  transition: transform .35s var(--vl-ease), box-shadow .35s var(--vl-ease), border-color .35s var(--vl-ease);
}
body button::before,
body a[class*="button"]::before,
body a[class*="Button"]::before {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-120%);
  background: linear-gradient(105deg, transparent 20%, rgba(255,255,255,.38) 50%, transparent 80%);
  transition: transform .7s var(--vl-ease);
  pointer-events: none;
}
body button:hover::before,
body a[class*="button"]:hover::before,
body a[class*="Button"]:hover::before { transform: translateX(120%); }
body button:hover,
body a[class*="button"]:hover,
body a[class*="Button"]:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,.22), 0 0 30px rgba(201,162,39,.13);
}

body section h2 {
  position: relative;
  letter-spacing: -.035em;
  background: linear-gradient(110deg, #F7F3EA, #E7C9A9 40%, #C9A227 70%, #FFF1C8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
body section h2::after {
  content: "";
  display: block;
  width: 56px;
  height: 1px;
  margin-top: 18px;
  background: linear-gradient(90deg, transparent, var(--vl-gold), transparent);
  box-shadow: 0 0 16px rgba(201,162,39,.45);
}

body #services { position: relative; isolation: isolate; }
body #services::before {
  content: "";
  position: absolute;
  width: 360px;
  height: 360px;
  left: -180px;
  top: 20%;
  border-radius: 50%;
  background: rgba(201,162,39,.08);
  filter: blur(90px);
  animation: vlOrb 12s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: -1;
}
@keyframes vlOrb {
  from { transform: translate3d(0,0,0) scale(.8); }
  to { transform: translate3d(100px,-50px,0) scale(1.2); }
}
body #services article,
body #services [class*="card"],
body #services [class*="Card"] {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--vl-border);
  background: linear-gradient(145deg, rgba(255,255,255,.065), rgba(255,255,255,.018));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 20px 55px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.045);
  transition: transform .6s var(--vl-ease), box-shadow .6s var(--vl-ease), border-color .6s var(--vl-ease);
}
body #services article::before,
body #services [class*="card"]::before {
  content: "";
  position: absolute;
  width: 180px;
  height: 180px;
  right: -80px;
  top: -80px;
  border-radius: 50%;
  background: rgba(201,162,39,.10);
  filter: blur(30px);
  transition: transform .7s var(--vl-ease);
}
body #services article:hover,
body #services [class*="card"]:hover {
  transform: translateY(-10px) rotateX(2deg) rotateY(-2deg);
  border-color: rgba(201,162,39,.48);
  box-shadow: 0 30px 80px rgba(0,0,0,.26), 0 0 45px rgba(201,162,39,.09), inset 0 1px 0 rgba(255,255,255,.08);
}
body #services article:hover::before,
body #services [class*="card"]:hover::before { transform: scale(1.5); }

body #gallery { position: relative; }
body #gallery img {
  display: block;
  width: 100%;
  object-fit: cover;
  filter: saturate(.88) contrast(1.02);
  transform: scale(1.001);
  transition: transform 1s var(--vl-ease), filter .7s ease;
}
body #gallery a,
body #gallery figure,
body #gallery [class*="card"] {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(201,162,39,.18);
  box-shadow: 0 25px 65px rgba(0,0,0,.25);
  transition: transform .7s var(--vl-ease), box-shadow .7s var(--vl-ease);
}
body #gallery a::after,
body #gallery figure::after,
body #gallery [class*="card"]::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 35%, rgba(255,255,255,.12) 50%, transparent 65%);
  background-size: 250% 250%;
  background-position: 120% 120%;
  transition: background-position 1s var(--vl-ease);
  pointer-events: none;
}
body #gallery a:hover,
body #gallery figure:hover,
body #gallery [class*="card"]:hover {
  transform: translateY(-12px) rotate(-1deg);
  box-shadow: 0 40px 90px rgba(0,0,0,.32), 0 0 35px rgba(201,162,39,.12);
}
body #gallery a:hover img,
body #gallery figure:hover img,
body #gallery [class*="card"]:hover img { transform: scale(1.08); filter: saturate(1.08) contrast(1.04); }
body #gallery a:hover::after,
body #gallery figure:hover::after,
body #gallery [class*="card"]:hover::after { background-position: -20% -20%; }

body #team [class*="card"],
body #team article {
  overflow: hidden;
  border: 1px solid rgba(201,162,39,.17);
  background: linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.015));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  transition: transform .6s var(--vl-ease), border-color .5s ease, box-shadow .6s var(--vl-ease);
}
body #team [class*="card"]:hover,
body #team article:hover {
  transform: translateY(-10px);
  border-color: rgba(201,162,39,.42);
  box-shadow: 0 35px 70px rgba(0,0,0,.25), 0 0 35px rgba(201,162,39,.09);
}
body #team img { transition: transform .8s var(--vl-ease), filter .6s ease; }
body #team [class*="card"]:hover img,
body #team article:hover img { transform: scale(1.06); filter: saturate(1.08); }

body #testimonials { position: relative; isolation: isolate; }
body #testimonials::before {
content: "\u201C";
  position: absolute;
  left: 5%;
  top: -40px;
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(180px, 25vw, 360px);
  line-height: 1;
  color: rgba(201,162,39,.055);
  pointer-events: none;
  z-index: -1;
}
body #testimonials [class*="card"],
body #testimonials article {
  border: 1px solid rgba(201,162,39,.18);
  background: linear-gradient(145deg, rgba(255,255,255,.065), rgba(255,255,255,.015));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 25px 65px rgba(0,0,0,.17), inset 0 1px 0 rgba(255,255,255,.045);
  transition: transform .55s var(--vl-ease), border-color .5s ease;
}
body #testimonials [class*="card"]:hover,
body #testimonials article:hover { transform: translateY(-8px); border-color: rgba(201,162,39,.45); }

body #contact {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: radial-gradient(circle at 50% 0%, rgba(201,162,39,.14), transparent 42%);
}
body #contact::after {
  content: "";
  position: absolute;
  width: 420px;
  height: 420px;
  right: -180px;
  bottom: -180px;
  border-radius: 50%;
  border: 1px solid rgba(201,162,39,.12);
  box-shadow: 0 0 0 40px rgba(201,162,39,.025), 0 0 0 80px rgba(201,162,39,.018), 0 0 0 120px rgba(201,162,39,.012);
  animation: vlRing 14s linear infinite;
  pointer-events: none;
}
@keyframes vlRing { to { transform: rotate(360deg); } }
body #contact [class*="card"],
body #contact form {
  border: 1px solid rgba(201,162,39,.2);
  background: linear-gradient(145deg, rgba(255,255,255,.065), rgba(255,255,255,.018));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 30px 80px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.05);
}

body input,
body textarea,
body select {
  background: rgba(255,255,255,.045) !important;
  border: 1px solid rgba(201,162,39,.18) !important;
  color: var(--vl-cream) !important;
  transition: border-color .35s ease, box-shadow .35s ease, background .35s ease;
}
body input:focus,
body textarea:focus,
body select:focus {
  outline: none !important;
  background: rgba(255,255,255,.065) !important;
  border-color: rgba(201,162,39,.65) !important;
  box-shadow: 0 0 0 4px rgba(201,162,39,.08), 0 0 30px rgba(201,162,39,.08);
}

body footer {
  position: relative;
  border-top: 1px solid rgba(201,162,39,.13);
  background: linear-gradient(180deg, rgba(5,25,19,.35), rgba(3,17,13,.85));
}
body footer::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  width: 180px;
  height: 1px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, var(--vl-gold), transparent);
  box-shadow: 0 0 20px rgba(201,162,39,.5);
}

body section > * { animation: vlReveal .9s var(--vl-ease) both; }
body section > *:nth-child(2) { animation-delay: .08s; }
body section > *:nth-child(3) { animation-delay: .16s; }
body section > *:nth-child(4) { animation-delay: .24s; }
@keyframes vlReveal {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}

body #hero,
body #services,
body #gallery { --particle: rgba(201,162,39,.7); }
body #hero::marker { display: none; }

@media (max-width: 900px) {
  body #hero { min-height: 620px; }
  body #hero h1 { font-size: clamp(3rem, 12vw, 5.5rem); }
  body section { overflow: hidden; }
}
@media (max-width: 640px) {
  body { --vl-radius: 14px; }
  body #hero { min-height: 580px; }
  body #hero::before { width: 340px; height: 340px; right: -160px; }
  body #services article:hover,
  body #services [class*="card"]:hover,
  body #team article:hover,
  body #team [class*="card"]:hover { transform: translateY(-5px); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}`;

const template = {
  meta: {
    id: "velora-salon-spa",
    slug: "velora-salon-spa",
    title: "Velora Salon & Spa",
    description: "A premium emerald-and-gold salon experience with editorial typography, refined glass surfaces, elegant service cards, luxury imagery, subtle motion, and a sophisticated booking experience.",
    category: "business",
    author: "Oninsite Design Studio",
    version: "2.0.0",
    tags: ["Salon", "Luxury", "Emerald & Gold", "Premium", "Elegant", "Animated"],
    popularity: 98,
    isNew: true,
    status: "published",
  },
  theme: {
    primaryColor: "#C9A227",
    secondaryColor: "#0B3B2E",
    accentColor: "#E7C9A9",
    backgroundColor: "#0B3B2E",
    textColor: "#F7F3EA",
    fontFamily: "Inter",
    headingFont: "Cormorant Garamond",
    bodyFont: "Jost",
    borderRadius: "18px",
    buttonVariant: "pill",
    cardVariant: "glass",
    shadow: "xl",
    mode: "dark",
    spacingScale: "roomy",
    animations: true,
  },
  sections: [
    {
      id: "navbar",
      type: "navbar",
      variant: "transparent",
      content: {
        ctaText: "Book Your Ritual",
        ctaLink: "#contact",
        links: [
          { label: "Services", url: "#services" },
          { label: "Gallery", url: "#gallery" },
          { label: "Our Team", url: "#team" },
          { label: "Stories", url: "#testimonials" },
          { label: "Contact", url: "#contact" },
        ],
      },
      visible: true,
    },
    {
      id: "hero",
      type: "hero",
      variant: "split",
      title: "Radiance, Redefined.",
      subtitle: "Where modern artistry meets timeless indulgence — hair, skin and body rituals crafted around the way you want to feel.",
      badge: "✦ Emerald City's Premier Salon Since 2010",
      content: {
        ctaText: "Reserve Your Ritual",
        ctaLink: "#contact",
        secondaryCtaText: "Explore Services",
        secondaryCtaLink: "#services",
        avatarUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80",
        stats: [
          { label: "Years of Craft", value: "15+" },
          { label: "Happy Clients", value: "20K+" },
          { label: "Master Stylists", value: "12" },
          { label: "Average Rating", value: "4.9★" },
        ],
      },
      visible: true,
    },
    {
      id: "services",
      type: "menu_list",
      variant: "default",
      title: "Rituals Crafted Around You",
      subtitle: "Signature treatments for hair, skin, nails and complete-body renewal.",
      content: {
        categories: [
          {
            name: "Hair",
            items: [
              { name: "Signature Cut & Style", desc: "Precision cut finished with a personalized blowout.", price: "$85", badge: "POPULAR" },
              { name: "Balayage & Color Melt", desc: "Hand-painted dimension designed around your features.", price: "$220" },
              { name: "Keratin Smoothing", desc: "Long-lasting smoothness, shine and effortless styling.", price: "$180" },
            ],
          },
          {
            name: "Skin",
            items: [
              { name: "Gold Collagen Facial", desc: "A luminous facial ritual focused on hydration and radiance.", price: "$120" },
              { name: "Velora Glow Facial", desc: "Deep cleansing, exfoliation and signature glow treatment.", price: "$145" },
            ],
          },
          {
            name: "Body",
            items: [
              { name: "Aromatherapy Massage", desc: "A calming full-body ritual using botanical oils.", price: "$110" },
              { name: "Hot Stone Therapy", desc: "Deep relaxation through warmth and therapeutic pressure.", price: "$135" },
            ],
          },
          {
            name: "Bridal",
            items: [
              { name: "Velora Bridal Experience", desc: "A complete beauty experience designed for your biggest moment.", price: "$450", badge: "SIGNATURE" },
            ],
          },
        ],
      },
      visible: true,
    },
    {
      id: "gallery",
      type: "gallery",
      variant: "masonry",
      title: "Inside Velora",
      subtitle: "A space designed for slowing down.",
      content: {
        images: [
          { url: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=700&q=80", alt: "Velora salon interior" },
          { url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=700&q=80", alt: "Hair color treatment" },
          { url: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=80", alt: "Private salon suite" },
          { url: "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=700&q=80", alt: "Finished hairstyle" },
          { url: "https://images.unsplash.com/photo-1595475884562-073c30d45670?auto=format&fit=crop&w=700&q=80", alt: "Facial treatment" },
        ],
      },
      visible: true,
    },
    {
      id: "team",
      type: "team",
      variant: "default",
      title: "The Artists Behind Velora",
      subtitle: "Experienced specialists who treat every appointment as a craft.",
      content: {
        members: [
          { name: "Adriana Costa", role: "Founder & Master Colorist", avatar: "https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&w=400&q=80", bio: "15 years specializing in dimensional color and bespoke transformations." },
          { name: "Julien Marchand", role: "Senior Hair Stylist", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=400&q=80", bio: "Editorial cutting specialist trained in Paris." },
          { name: "Sofia Reyes", role: "Skin & Wellness Specialist", avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80", bio: "Specialist in luxury facials, skin rituals and restorative treatments." },
        ],
      },
      visible: true,
    },
    {
      id: "testimonials",
      type: "testimonials",
      variant: "default",
      title: "Stories From Our Clients",
      subtitle: "The Velora experience, in their own words.",
      content: {
        items: [
          { quote: "Velora doesn't just style your hair — it resets you. I leave every appointment feeling like a more radiant version of myself.", author: "Hannah Price", role: "Client since 2019", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" },
          { quote: "The attention to detail is incredible. Everything feels intentional, calm and genuinely luxurious.", author: "Marisol Ibarra", role: "Client since 2021", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=100&q=80" },
          { quote: "I came for the color and stayed for the entire experience. Velora feels completely different from a typical salon.", author: "Clara Bennett", role: "Client since 2022", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" },
        ],
      },
      visible: true,
    },
    {
      id: "contact",
      type: "contact",
      variant: "default",
      title: "Reserve Your Ritual",
      subtitle: "Limited appointments available each week. Walk-ins welcome, reservations preferred.",
      content: {
        email: "hello@velorasalon.com",
        phone: "+1 (212) 555-0198",
        address: "88 Blossom Lane, New York, NY",
        hours: "Tue – Sun: 9AM – 7PM",
        instagram: "https://instagram.com",
        ctaText: "Book an Appointment",
        ctaLink: "tel:+12125550198",
      },
      visible: true,
    },
    {
      id: "footer",
      type: "footer",
      variant: "default",
      title: "Velora Salon & Spa",
      content: {},
      visible: true,
    },
  ],
  seo: {
    metaTitle: "Velora Salon & Spa — Radiance, Redefined",
    metaDescription: "Luxury salon and spa offering signature hair, skin, nail and wellness rituals in an elegant emerald-and-gold setting.",
    ogImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    keywords: ["luxury salon", "spa website", "hair salon", "beauty salon", "emerald gold salon", "premium salon"],
  },
  customCode: {
    html: "",
    css: CSS,
    js: "",
  },
};

// 1) Validate it round-trips (JSON.parse(JSON.stringify(x)) === x)
const json = JSON.stringify(template, null, 2);
try {
  JSON.parse(json);
  console.log("VALID JSON — round-trip OK");
} catch (e) {
  console.error("INVALID:", e.message);
  process.exit(1);
}

// 2) Write a single-template import file (for Bulk Import UI)
writeFileSync(new URL("./velora-salon-spa.json", import.meta.url), json, "utf8");

// 3) Also write an array wrapper for the bulk-import endpoint
const arrayJson = JSON.stringify([template], null, 2);
writeFileSync(new URL("./velora-salon-spa-array.json", import.meta.url), arrayJson, "utf8");

console.log("Wrote scripts/velora-salon-spa.json and scripts/velora-salon-spa-array.json");
