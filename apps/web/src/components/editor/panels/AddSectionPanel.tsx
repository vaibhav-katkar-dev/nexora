"use client";

import { useEditorStore } from "@/store/editorStore";
import { useToast } from "@/components/ui/Toast";
import {
  Sparkles,
  User,
  Zap,
  Palette,
  UtensilsCrossed,
  Layers,
  CreditCard,
  AlignLeft,
  Mail,
  Link2,
  Code2,
  Plus,
  Navigation,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Briefcase,
  Users,
  Star,
  Image,
  Youtube,
} from "lucide-react";

interface AddSectionPanelProps {
  onSectionAdded: (id: string) => void;
}

const SECTION_TEMPLATES = [
  { type: "hero", label: "Hero Banner", desc: "Main title, call-to-action & key metrics", icon: Sparkles },
  { type: "navbar", label: "Navigation Bar", desc: "Sticky header with links & call-to-action", icon: Navigation },
  { type: "about", label: "About Me / Bio", desc: "Personal bio, skills grid & highlights", icon: User },
  { type: "features", label: "Features Grid", desc: "3-column grid highlighting key capabilities", icon: Zap },
  { type: "services", label: "Services Section", desc: "Service cards with icons, descriptions & links", icon: Briefcase },
  { type: "products", label: "Products / Shop", desc: "Product cards with prices, images & buy buttons", icon: ShoppingBag },
  { type: "portfolio_grid", label: "Projects / Portfolio", desc: "Visual showcase cards for work samples", icon: Palette },
  { type: "menu_list", label: "Food / Drink Menu", desc: "Categorized menu items with prices", icon: UtensilsCrossed },
  { type: "timeline", label: "Career & Education", desc: "Chronological career history timeline", icon: Layers },
  { type: "pricing", label: "Pricing Tiers", desc: "Structured subscription or plan options", icon: CreditCard },
  { type: "faq", label: "FAQ Accordion", desc: "Frequently asked questions & answers", icon: AlignLeft },
  { type: "team", label: "Team Members", desc: "Team grid with photos, roles & bios", icon: Users },
  { type: "testimonials", label: "Testimonials", desc: "Customer reviews with star ratings", icon: Star },
  { type: "gallery", label: "Photo Gallery", desc: "Image grid or masonry photo gallery", icon: Image },
  { type: "contact", label: "Contact Form & Details", desc: "Email, social handles & contact form", icon: Mail },
  { type: "maps", label: "Google Map", desc: "Embed a map via address or lat/long", icon: MapPin },
  { type: "whatsapp", label: "WhatsApp Button", desc: "Floating chat button with prefilled message", icon: MessageCircle },
  { type: "links", label: "Link in Bio", desc: "Button list for social media links", iconComp: Link2 },
  { type: "video", label: "YouTube Video Embed", desc: "Responsive YouTube video player with custom link", iconComp: Youtube },
  { type: "digital_card", label: "Digital VCard", desc: "Digital business card layout", iconComp: CreditCard },
  { type: "custom_html", label: "Custom HTML Code Block", desc: "Insert custom HTML/CSS embed block", iconComp: Code2 },
];

export function AddSectionPanel({ onSectionAdded }: AddSectionPanelProps) {
  const { addSection } = useEditorStore();
  const toast = useToast();

  const handleAddPreset = (type: string, label: string) => {
    const newId = `${type}-${Date.now()}`;
    addSection({
      id: newId,
      type,
      variant: "default",
      title: label,
      subtitle: `Description for ${label}`,
      content: getStarterContent(type),
      visible: true,
    });
    toast.success("Section Added!", `${label} added to your layout.`);
    onSectionAdded(newId);
  };

  const getStarterContent = (type: string) => {
    switch (type) {
      case "hero":
        return {
          badge: "🚀 Next-Gen Digital Platform",
          ctaText: "Get Started Free",
          ctaLink: "#contact",
          secondaryCtaText: "Explore Features",
          secondaryCtaLink: "#features",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          stats: [
            { value: "100+", label: "Projects Shipped" },
            { value: "99.9%", label: "Platform Uptime" },
            { value: "50k+", label: "Active Users" },
          ],
        };

      case "about":
        return {
          bio: "Passionate product architect and designer crafting high-performance, accessible digital experiences for startups and enterprise teams globally.",
          skills: ["React / Next.js", "TypeScript", "Tailwind CSS", "Node.js", "AI Systems", "UI/UX Architecture"],
          highlights: ["10+ years building scalable web platforms", "Shipped applications reaching over 1M+ active users", "Dedicated to intuitive, accessible, and fast web design"],
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
        };

      case "features":
        return {
          items: [
            { icon: "Sparkles", title: "Lightning Fast Engine", desc: "Sub-second response times and optimized assets for maximum engagement.", url: "#", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80" },
            { icon: "Zap", title: "AI-Powered Automation", desc: "Automated content generation, smart layout expansion, and instant updates.", url: "#", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" },
            { icon: "Shield", title: "Enterprise Grade Security", desc: "Built with end-to-end encryption, strict access controls, and 99.9% uptime.", url: "#", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80" },
          ],
        };

      case "services":
        return {
          items: [
            { icon: "Briefcase", title: "Strategic Consulting", desc: "Expert strategic advisory tailored to scale your brand and streamline operations.", buttonText: "Learn More", url: "#contact", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" },
            { icon: "Zap", title: "Full-Stack Development", desc: "High-performance web applications built with modern architectures and clean code.", buttonText: "See Work", url: "#portfolio", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80" },
            { icon: "Sparkles", title: "AI & Automation Solutions", desc: "Integrate cutting-edge AI models and automated workflows directly into your platform.", buttonText: "Get Quote", url: "#contact", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" },
          ],
        };

      case "products":
        return {
          items: [
            { title: "Smart AI Headphones", desc: "Active noise cancellation with real-time neural audio tuning and 40-hour battery life.", price: "$299", badge: "POPULAR", buttonText: "Buy Now", url: "#", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
            { title: "Minimalist Mechanical Keyboard", desc: "Hot-swappable switches, wireless multi-device pairing & anodized aluminum chassis.", price: "$179", badge: "BEST VALUE", buttonText: "Buy Now", url: "#", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80" },
            { title: "Ergonomic Desk Setup Pack", desc: "Precision crafted wooden monitor riser, felt desk mat, and ambient lightbar.", price: "$129", badge: "NEW", buttonText: "Learn More", url: "#", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80" },
          ],
        };

      case "portfolio_grid":
        return {
          projects: [
            {
              name: "NeuralStudio AI Canvas",
              desc: "Generative canvas editor for real-time graphics and LLM orchestration.",
              tag: "AI / Next.js",
              url: "https://example.com",
              image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
            },
            {
              name: "HyperScale Cloud DB",
              desc: "Ultra low-latency distributed key-value store with WebAssembly bindings.",
              tag: "Systems / Rust",
              url: "https://example.com",
              image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
            },
            {
              name: "Vanguard Design System",
              desc: "Accessible enterprise UI kit used by over 50+ engineering teams.",
              tag: "Design / React",
              url: "https://example.com",
              image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
            },
          ],
        };

      case "menu_list":
        return {
          layout: "grid",
          categories: [
            {
              name: "Chef's Signature Dishes",
              items: [
                { name: "Tagliolini Al Tartufo", desc: "Handcrafted egg pasta, shaved black winter truffle, Parmigiano Reggiano.", price: "$32", badge: "SIGNATURE", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80", buttonText: "Order Now", url: "#order" },
                { name: "Pan-Seared Sea Bass", desc: "Wild-caught sea bass, saffron risotto, Meyer lemon emulsion.", price: "$38", badge: "FRESH", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80", buttonText: "Order Now", url: "#order" },
                { name: "Wagyu Beef Tenderloin", desc: "A5 Wagyu, truffle demi-glace, roasted baby vegetables, Bordelaise reduction.", price: "$95", badge: "CHEF'S PICK", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80", buttonText: "Reserve", url: "#reserve" },
              ],
            },
            {
              name: "Artisan Desserts",
              items: [
                { name: "Valrhona Chocolate Fondant", desc: "Dark chocolate lava cake, Madagascar vanilla ice cream, gold leaf.", price: "$18", badge: "", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80", buttonText: "", url: "" },
                { name: "Tiramisu Classico", desc: "House-made mascarpone, espresso-soaked ladyfingers, Kahlua dusting.", price: "$16", badge: "POPULAR", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80", buttonText: "", url: "" },
              ],
            },
          ],
        };

      case "timeline":
        return {
          items: [
            { period: "2024 - Present", role: "Principal Architect", company: "Nexora AI", desc: "Leading platform engine development and scalable component design." },
            { period: "2021 - 2024", role: "Senior Full-Stack Engineer", company: "TechCorp Inc.", desc: "Architected high-throughput microservices and React design systems." },
          ],
        };

      case "pricing":
        return {
          plans: [
            { name: "Starter", price: "$29", desc: "Ideal for individual creators", features: ["1 Published Site", "Standard Analytics", "Community Support"], isPopular: false },
            { name: "Pro", price: "$79", desc: "For growing businesses", features: ["Unlimited Sites", "Custom Domain", "24/7 Priority Support", "AI Assistant"], isPopular: true, badge: "MOST POPULAR" },
          ],
        };

      case "faq":
        return {
          items: [
            { question: "How does Nexora build sites?", answer: "Nexora combines AI prompts with modular templates to generate production-ready websites instantly." },
            { question: "Can I connect my custom domain?", answer: "Yes! You can publish your site directly with custom URL slugs or your custom domain name." },
          ],
        };

      case "navbar":
        return {
          links: [
            { label: "Home", url: "#home" },
            { label: "About", url: "#about" },
            { label: "Services", url: "#services" },
            { label: "Contact", url: "#contact" },
          ],
          ctaText: "Get Started",
          ctaLink: "#contact",
        };

      case "maps":
        return {
          address: "1600 Amphitheatre Pkwy, Mountain View, CA 94043",
          lat: "",
          lng: "",
          zoom: 15,
          height: 380,
        };

      case "whatsapp":
        return {
          phone: "15551234567",
          buttonText: "Chat on WhatsApp",
          defaultText: "Hi! I'd like to know more about your services.",
          availability: "Typically replies within an hour",
        };

      case "links":
        return {
          links: [
            { label: "Personal Portfolio Website", url: "https://example.com", badge: "FEATURED" },
            { label: "GitHub Profile & Code Repos", url: "https://github.com" },
            { label: "Twitter / X Profile", url: "https://twitter.com" },
          ],
        };

      case "digital_card":
        return {
          bio: "Senior Product Architect & AI Specialist crafting next-generation web platforms.",
          location: "San Francisco, CA",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          socials: { email: "alex@example.com", phone: "+1 (555) 234-5678", linkedin: "https://linkedin.com", twitter: "https://twitter.com" },
        };

      case "contact":
        return {
          email: "alex.rivera@example.com",
          phone: "+1 (555) 234-5678",
          address: "428 West Broadway, SoHo, New York, NY 10012",
          hours: "Mon - Fri: 9:00 AM - 6:00 PM EST",
        };

      case "custom_html":
        return {
          html: `<div class="p-8 text-center border border-indigo-500/30 rounded-2xl bg-indigo-950/20">\n  <h3 className="text-xl font-bold text-indigo-400">Custom HTML Block</h3>\n  <p className="text-sm text-slate-300 mt-2">Edit this raw HTML code directly in Monaco Code Editor!</p>\n</div>`,
        };

      case "team":
        return {
          members: [
            { name: "Alex Rivera", role: "CEO & Co-Founder", desc: "Visionary leader with 10+ years in product strategy and AI.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", url: "" },
            { name: "Jordan Lee", role: "CTO", desc: "Full-stack architect specializing in scalable distributed systems.", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80", url: "" },
            { name: "Sam Chen", role: "Head of Design", desc: "Award-winning UX designer passionate about beautiful interfaces.", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", url: "" },
          ],
        };

      case "testimonials":
        return {
          items: [
            { name: "Michael Thompson", role: "CEO, TechStart Inc.", quote: "This platform transformed our entire digital presence in under a week. Absolutely phenomenal.", rating: 5 },
            { name: "Sarah Johnson", role: "Product Manager, Acme Corp", quote: "The AI tools and customization options are second to none. Our team productivity doubled.", rating: 5 },
            { name: "David Kim", role: "Founder, LaunchPad", quote: "Beautiful design, fast loading, and incredibly easy to manage. Worth every penny.", rating: 5 },
          ],
        };

      case "gallery":
        return {
          images: [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80",
          ],
        };

      case "video":
        return {
          badge: "🎬 Featured Video",
          title: "Watch Our Featured Reel",
          subtitle: "Paste any YouTube video or Shorts URL in the Inspector panel to embed your stream live.",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          caption: "Streamed via YouTube HD Player",
        };

      default:
        return {};
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-full flex-shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Plus size={16} className="text-indigo-400" /> Add Section Block
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Click any block to insert it into your page</p>
      </div>

      {/* Preset List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {SECTION_TEMPLATES.map((tmpl) => {
          const Icon = tmpl.iconComp || tmpl.icon || Plus;

          return (
            <button
              key={tmpl.type}
              onClick={() => handleAddPreset(tmpl.type, tmpl.label)}
              className="w-full text-left p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 rounded-xl transition-all flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-400 transition-colors">
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {tmpl.label}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{tmpl.desc}</p>
              </div>
              <Plus size={14} className="text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
