"use client";

import { useState, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { aiApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Sparkles, Send, Loader2, X, Plus, Palette, HelpCircle, Layers } from "lucide-react";
import { SiteConfigJSON } from "@ai-platform/shared";

const SUGGESTIONS = [
  { label: "Add FAQ", prompt: "Add a clean FAQ section with 4 helpful questions and answers", icon: HelpCircle },
  { label: "Add Pricing", prompt: "Add a 3-tier pricing section with Starter, Pro, and Enterprise plans", icon: Layers },
  { label: "Dark Gold Theme", prompt: "Restyle the theme to luxury midnight obsidian with gold accents (#D4AF37)", icon: Palette },
  { label: "Refine Headlines", prompt: "Rewrite hero and section headlines to be punchy, high-converting, and modern", icon: Sparkles },
];

export function AiCanvasPromptBar() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const config = useEditorStore((state) => state.config);
  const setConfig = useEditorStore((state) => state.setConfig);
  const pushHistorySnapshot = useEditorStore((state) => state.pushHistorySnapshot);
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (customPrompt?: string) => {
    const text = (customPrompt || prompt).trim();
    if (!text || !config || isLoading) return;

    setIsLoading(true);
    pushHistorySnapshot();

    try {
      const systemInstruction = `You are an expert web designer. Modify the following website JSON configuration according to the user request.
Return the complete updated SiteConfigJSON matching the schema.
User Request: "${text}"

Current Website Config:
${JSON.stringify(config, null, 2)}`;

      const res = await aiApi.generate({ prompt: systemInstruction });
      if (res?.data?.config && Array.isArray(res.data.config.sections)) {
        setConfig(res.data.config, true);
        toast.success("AI Update Applied", "Site updated. Press Ctrl+Z to undo anytime.");
        setPrompt("");
        setIsOpen(false);
      } else {
        handleSmartFallback(text);
      }
    } catch {
      handleSmartFallback(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartFallback = (text: string) => {
    if (!config) return;
    const lower = text.toLowerCase();
    const cloned = JSON.parse(JSON.stringify(config)) as SiteConfigJSON;

    if (lower.includes("gold") || lower.includes("luxury")) {
      cloned.theme.primaryColor = "#F59E0B";
      cloned.theme.backgroundColor = "#090D16";
      cloned.theme.accentColor = "#D97706";
      setConfig(cloned, true);
      toast.success("Theme Updated", "Applied Luxury Gold theme.");
      setPrompt("");
      setIsOpen(false);
      return;
    }

    if (lower.includes("emerald") || lower.includes("green")) {
      cloned.theme.primaryColor = "#10B981";
      cloned.theme.secondaryColor = "#059669";
      cloned.theme.backgroundColor = "#061A14";
      setConfig(cloned, true);
      toast.success("Theme Updated", "Applied Emerald Oasis theme.");
      setPrompt("");
      setIsOpen(false);
      return;
    }

    if (lower.includes("faq")) {
      const newFaq = {
        id: `faq-${Date.now()}`,
        type: "faq" as const,
        variant: "default",
        visible: true,
        title: "Frequently Asked Questions",
        subtitle: "Everything you need to know about our services and process.",
        content: {
          items: [
            { question: "How quickly can I get started?", answer: "You can get started immediately with zero setup required." },
            { question: "Can I customize every section?", answer: "Yes, all headlines, photos, links, and themes are 100% editable." },
            { question: "How do leads reach me?", answer: "Inquiries are delivered directly to your WhatsApp and email in real-time." },
            { question: "Can I use my own domain?", answer: "Yes, you can connect your custom domain with automatic SSL included." },
          ],
        },
      };
      cloned.sections.push(newFaq);
      setConfig(cloned, true);
      toast.success("Section Added", "Added FAQ section.");
      setPrompt("");
      setIsOpen(false);
      return;
    }

    if (lower.includes("pricing")) {
      const newPricing = {
        id: `pricing-${Date.now()}`,
        type: "pricing" as const,
        variant: "default",
        visible: true,
        title: "Simple, Transparent Pricing",
        subtitle: "Choose the package that fits your goals.",
        content: {
          items: [
            { name: "Starter", price: "$29", period: "/mo", desc: "Perfect for individuals and small projects", features: ["1 Active Project", "WhatsApp Integration", "Fast Hosting"], buttonText: "Get Started", url: "#contact", isPopular: false },
            { name: "Professional", price: "$79", period: "/mo", desc: "For growing businesses & agencies", features: ["Unlimited Projects", "Custom Domain", "Priority 24/7 Support", "Analytics Dashboard"], buttonText: "Choose Pro", url: "#contact", isPopular: true, badge: "POPULAR" },
            { name: "Enterprise", price: "$199", period: "/mo", desc: "Dedicated support & custom solutions", features: ["Dedicated Account Manager", "Custom Integrations", "SLA Guarantee"], buttonText: "Contact Us", url: "#contact", isPopular: false },
          ],
        },
      };
      cloned.sections.push(newPricing);
      setConfig(cloned, true);
      toast.success("Section Added", "Added Pricing section.");
      setPrompt("");
      setIsOpen(false);
      return;
    }

    if (lower.includes("testimonial") || lower.includes("review")) {
      const newTestimonials = {
        id: `testimonials-${Date.now()}`,
        type: "testimonials" as const,
        variant: "default",
        visible: true,
        title: "Client Testimonials",
        subtitle: "What our customers say about working with us.",
        content: {
          items: [
            { name: "Sarah Jenkins", role: "Founder, Bloom Studio", quote: "The speed and quality blew us away. Our leads doubled within the first week of launch!", rating: 5 },
            { name: "Marcus Chen", role: "Managing Director, Apex Tech", quote: "Flawless mobile experience and the WhatsApp integration converts visitors like magic.", rating: 5 },
            { name: "Elena Rostova", role: "Creative Director", quote: "Clean aesthetic, fast loading times, and ridiculously easy to customize anytime.", rating: 5 },
          ],
        },
      };
      cloned.sections.push(newTestimonials);
      setConfig(cloned, true);
      toast.success("Section Added", "Added Testimonials section.");
      setPrompt("");
      setIsOpen(false);
      return;
    }

    toast.info("Notice", "Describe any section to add or theme to restyle.");
  };

  return (
    <div className="hidden md:block fixed bottom-4 right-4 z-40 select-none">
      {!isOpen ? (
        /* Discreet Collapsed Trigger Button */
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="h-10 px-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group"
          title="Open AI Assistant"
        >
          <Sparkles size={14} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span>AI Assistant</span>
        </button>
      ) : (
        /* Sleek Expanded Floating Card */
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 w-80 sm:w-96 text-white space-y-2.5 backdrop-blur-xl animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Sparkles size={13} className="text-indigo-400" />
              <span>AI Site Assistant</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Clean Prompt Chips */}
          <div className="flex flex-wrap gap-1">
            {SUGGESTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setPrompt(s.prompt);
                    handleSubmit(s.prompt);
                  }}
                  className="text-[10px] font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-md px-2 py-0.5 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Icon size={10} className="text-indigo-400" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-1.5 pt-1"
          >
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a change or section to add..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="h-8 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-30 transition-all flex items-center justify-center shrink-0"
              title="Apply change"
            >
              {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={12} />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
