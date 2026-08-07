"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { aiApi, projectsApi, authApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { SiteConfigJSON } from "@ai-platform/shared";
import { Navbar } from "@/components/navigation/Navbar";
import {
  Sparkles,
  Wand2,
  Loader2,
  Palette,
  FileText,
  CreditCard,
  UtensilsCrossed,
  Briefcase,
  Rocket,
  Lightbulb,
  User,
  CalendarDays,
  Link2,
  ArrowRight,
  Zap,
  Cpu,
  Coins,
  Check,
  Globe,
} from "lucide-react";

const AI_CATEGORIES = [
  { id: "portfolio", label: "Portfolio", icon: Palette, hint: "Showcase skills, projects, and case studies" },
  { id: "resume", label: "Resume", icon: FileText, hint: "Interactive CV with work experience & education timeline" },
  { id: "digital_card", label: "Digital Card", icon: CreditCard, hint: "vCard with socials, avatar, and quick contact details" },
  { id: "restaurant_menu", label: "Restaurant", icon: UtensilsCrossed, hint: "Food & drink menu with prices and categories" },
  { id: "business", label: "Business", icon: Briefcase, hint: "Company profile, core services, and lead contact form" },
  { id: "product_landing", label: "Product Landing", icon: Rocket, hint: "High-converting product showcase with feature grid" },
  { id: "startup_landing", label: "Startup Landing", icon: Lightbulb, hint: "SaaS & startup landing page with hero CTA" },
  { id: "personal", label: "Personal", icon: User, hint: "Personal story, blog, and social profile" },
  { id: "event", label: "Event", icon: CalendarDays, hint: "Conference/event agenda, speakers, and registration" },
  { id: "link_in_bio", label: "Link in Bio", icon: Link2, hint: "Curated social link aggregator for creators" },
];

const PRESET_PROMPTS = [
  {
    category: "portfolio",
    title: "Senior AI Researcher Portfolio",
    prompt: "A modern, dark-mode portfolio for a senior AI researcher highlighting LLM papers, GitHub projects, speaking engagements, and contact form.",
  },
  {
    category: "restaurant_menu",
    title: "Artisan Bakery & Bistro Menu",
    prompt: "An elegant restaurant site for an artisanal bakery featuring sourdough breads, specialty coffees, breakfast items with prices, and opening hours.",
  },
  {
    category: "startup_landing",
    title: "AI Automation Platform SaaS",
    prompt: "A bold startup landing page for an enterprise AI workflow automation SaaS with feature cards, pricing tiers, and interactive trial CTA.",
  },
  {
    category: "digital_card",
    title: "Creative Director Digital VCard",
    prompt: "A glassmorphism digital business card for a freelance Creative Director with headshot, bio, portfolio links, and 1-tap call/email buttons.",
  },
  {
    category: "link_in_bio",
    title: "Tech Creator Link-in-Bio",
    prompt: "A clean link-in-bio page for a tech YouTuber showcasing latest videos, newsletter signup, podcast links, and sponsor inquiries.",
  },
];

export default function AiBuilderPage() {
  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<{ email: string; role?: string; name?: string } | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("portfolio");
  const [selectedModel, setSelectedModel] = useState<string>(""); // Empty = Auto from server environment
  const [isGenerating, setIsGenerating] = useState(false);

  // Simple token estimator heuristic
  const estimatedTokens = Math.max(0, Math.ceil(aiPrompt.trim().length / 4.0));

  useEffect(() => {
    authApi
      .me()
      .then((res) => {
        if (res.data) setUser(res.data.user || res.data);
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.warning("Please enter a description for your website.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await aiApi.generate({
        prompt: aiPrompt,
        categoryHint: selectedCategory,
        model: selectedModel || undefined, // undefined lets server load AI_MODEL / GEMINI_MODEL from .env
      });

      if (res.data?.config) {
        const config: SiteConfigJSON = res.data.config;
        const siteName = config.meta.title || `AI Site — ${aiPrompt.slice(0, 25)}`;

        const createRes = await projectsApi.create({
          name: siteName,
          category: res.data.category || selectedCategory,
          config,
        });

        if (createRes.data?._id) {
          const tokenMsg = res.data.tokensUsed
            ? `Used ${res.data.tokensUsed.totalTokens} tokens`
            : "Generated";
          toast.success(`Site Generated with ${res.data.modelUsed || "Server Env Model"}!`, tokenMsg);
          router.push(`/editor/${createRes.data._id}`);
        }
      }
    } catch (err: any) {
      toast.error("AI Generation Failed", err.message || "Please try again with a refined prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar user={user} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* ── Header Banner ──────────────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs">
            <Sparkles size={14} className="text-indigo-600" /> AI Digital Architect Studio
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Describe Your Vision. <br />
            <span className="text-indigo-600">AI Builds Your Site.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Specify your website topic, tone, and sections below. Dynamically powered by server environment AI models with real-time Token Check.
          </p>
        </div>

        {/* ── Main Prompt Form Studio ─────────────────────────────────────── */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Step 1: Select Model Engine */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Cpu size={14} className="text-indigo-600" /> 1. Select AI Model Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedModel("")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedModel === ""
                    ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between font-extrabold text-sm">
                  <span className="flex items-center gap-2">
                    <Globe size={16} className="text-indigo-600" /> Server Env (Auto)
                  </span>
                  {selectedModel === "" && (
                    <span className="bg-indigo-600 text-white p-1 rounded-full">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Dynamically loaded from process.env (AI_MODEL / GEMINI_MODEL).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel("gemini-2.5-flash")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedModel === "gemini-2.5-flash"
                    ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between font-extrabold text-sm">
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" /> Gemini 2.5 Flash
                  </span>
                  {selectedModel === "gemini-2.5-flash" && (
                    <span className="bg-indigo-600 text-white p-1 rounded-full">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Google high-speed LLM for instant structured JSON site specs.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel("gpt-4o-mini")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedModel === "gpt-4o-mini"
                    ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between font-extrabold text-sm">
                  <span className="flex items-center gap-2">
                    <Cpu size={16} className="text-indigo-600" /> GPT-4o Mini
                  </span>
                  {selectedModel === "gpt-4o-mini" && (
                    <span className="bg-indigo-600 text-white p-1 rounded-full">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  OpenAI compact model for website layout generation.
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Select Category */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              2. Select Category / Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {AI_CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold shadow-xs scale-[1.02]"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <IconComp size={18} className={`mb-1.5 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Prompt Textarea with Token Check Counter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                3. Describe Your Website Concept
              </label>
              <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600">
                <Coins size={13} className="text-amber-500" />
                <span>Prompt Token Check: ~{estimatedTokens} tokens</span>
              </div>
            </div>
            <textarea
              rows={5}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Create a sleek portfolio site for a freelance UI/UX designer with sections for about bio, selected client projects, design process features, and contact form..."
              className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none shadow-xs"
            />
          </div>

          {/* Preset Inspiration Prompt Chips */}
          <div className="space-y-2.5 pt-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Or pick an inspiration prompt:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(preset.category);
                    setAiPrompt(preset.prompt);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-xs text-slate-700 hover:text-indigo-700 transition-all font-medium flex items-center gap-1.5"
                >
                  <Zap size={12} className="text-amber-500" />
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span>Selected Engine:</span>
              <span className="font-bold text-indigo-600 font-mono">
                {selectedModel ? selectedModel : "Server Env (Auto)"}
              </span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating Site with AI…
                </>
              ) : (
                <>
                  <Wand2 size={16} /> Generate Site with AI <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
