"use client";

import { useEditorStore } from "@/store/editorStore";
import { Globe, Image as ImageIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { buildPublishedSiteUrl } from "@/lib/siteUrl";

export function SeoInspectorPanel() {
  const { seo, setSeo } = useEditorStore();

  const inputClass =
    "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm";

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-full flex-shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Globe size={16} className="text-indigo-400" /> Search &amp; Social (SEO)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Optimize how your site appears on Google &amp; social media</p>
      </div>

      {/* SEO Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Page Title (Meta Title)</label>
          <input
            type="text"
            value={seo.metaTitle || ""}
            onChange={(e) => setSeo({ metaTitle: e.target.value })}
            placeholder="e.g. Alex Rivera — Senior AI Researcher"
            className={inputClass}
          />
          <p className="text-[10px] text-slate-500 mt-1">Recommended: 50-60 characters</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Meta Description)</label>
          <textarea
            rows={4}
            value={seo.metaDescription || ""}
            onChange={(e) => setSeo({ metaDescription: e.target.value })}
            placeholder="e.g. Portfolio and publication list of Alex Rivera, focusing on generative AI and agentic systems..."
            className={`${inputClass} resize-none`}
          />
          <p className="text-[10px] text-slate-500 mt-1">Recommended: 150-160 characters</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
            <ImageIcon size={13} className="text-indigo-400" /> Social Card Image URL (OG Image)
          </label>
          <input
            type="text"
            value={seo.ogImage || ""}
            onChange={(e) => setSeo({ ogImage: e.target.value })}
            placeholder="https://example.com/og-image.png"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Keywords (Comma Separated)</label>
          <input
            type="text"
            value={(seo.keywords || []).join(", ")}
            onChange={(e) =>
              setSeo({ keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })
            }
            placeholder="portfolio, AI, machine learning, resume"
            className={inputClass}
          />
        </div>

        {/* Live Search Card Preview */}
        <div className="pt-3 border-t border-slate-800">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
            Google Search Preview
          </span>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-indigo-400 font-mono block truncate">
              {buildPublishedSiteUrl("site-preview")}
            </span>
            <h4 className="text-xs font-bold text-blue-400 truncate">
              {seo.metaTitle || "My Digital Presence"}
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              {seo.metaDescription || "Created with AI Digital Presence Platform..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
