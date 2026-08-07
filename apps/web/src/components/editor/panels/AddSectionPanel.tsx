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
} from "lucide-react";

interface AddSectionPanelProps {
  onSectionAdded: (id: string) => void;
}

const SECTION_TEMPLATES = [
  { type: "hero", label: "Hero Banner", desc: "Main title, call-to-action & key metrics", icon: Sparkles },
  { type: "about", label: "About Me / Bio", desc: "Personal bio, skills grid & highlights", icon: User },
  { type: "features", label: "Features Grid", desc: "3-column grid highlighting key capabilities", icon: Zap },
  { type: "portfolio_grid", label: "Projects / Portfolio", desc: "Visual showcase cards for work samples", icon: Palette },
  { type: "menu_list", label: "Food / Drink Menu", desc: "Categorized menu items with prices", icon: UtensilsCrossed },
  { type: "timeline", label: "Career & Education", desc: "Chronological career history timeline", icon: Layers },
  { type: "pricing", label: "Pricing Tiers", desc: "Structured subscription or plan options", icon: CreditCard },
  { type: "faq", label: "FAQ Accordion", desc: "Frequently asked questions & answers", icon: AlignLeft },
  { type: "contact", label: "Contact Form & Details", desc: "Email, social handles & contact form", icon: Mail },
  { type: "links", label: "Link in Bio", desc: "Button list for social media links", iconComp: Link2 },
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
          badge: "🚀 Welcome",
          ctaText: "Get Started",
          ctaLink: "#contact",
          secondaryCtaText: "Learn More",
          secondaryCtaLink: "#about",
          stats: [
            { value: "100+", label: "Projects Completed" },
            { value: "99%", label: "Client Satisfaction" },
          ],
        };

      case "about":
        return {
          bio: "Passionate engineer and product designer crafting modern, high-performance digital experiences.",
          skills: ["React", "TypeScript", "Tailwind CSS", "Node.js", "AI Architecture"],
          highlights: ["Over 5 years of industry experience", "Built 20+ commercial applications"],
        };

      case "features":
        return {
          items: [
            { icon: "Sparkles", title: "Lightning Fast", desc: "Sub-second response time and optimized assets." },
            { icon: "Zap", title: "AI Generation", desc: "Automated layout expansion and content copywriting." },
            { icon: "Shield", title: "Production Ready", desc: "Built with responsive layout and SEO standards." },
          ],
        };

      case "portfolio_grid":
        return {
          projects: [
            {
              name: "NeuralStudio AI",
              desc: "Generative canvas editor for real-time graphics and LLM orchestration.",
              tag: "AI / Next.js",
              url: "https://example.com",
              image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
            },
            {
              name: "HyperScale DB",
              desc: "Ultra low-latency distributed key-value store with WebAssembly bindings.",
              tag: "Systems / Rust",
              url: "https://example.com",
              image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
            },
          ],
        };

      case "menu_list":
        return {
          categories: [
            {
              name: "Chef's Specials",
              items: [
                { name: "Tagliolini Al Tartufo", desc: "House-made egg pasta, black truffle butter, aged parmesan.", price: "$28", badge: "POPULAR" },
                { name: "Burrata Pugliese", desc: "Heirloom tomatoes, 25-year balsamico, grilled sourdough.", price: "$22" },
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
