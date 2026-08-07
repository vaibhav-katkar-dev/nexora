"use client";

import { useState } from "react";
import { X, Globe, Check, AlertCircle, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getPublishedBaseLabel, buildPublishedSiteUrl } from "@/lib/siteUrl";

interface PublishModalProps {
  initialSlug: string;
  onConfirm: (slug: string) => Promise<void>;
  onClose: () => void;
}

export function PublishModal({ initialSlug, onConfirm, onClose }: PublishModalProps) {
  const RESERVED = ["dashboard", "login", "register", "editor", "admin", "api", "publish", "favicon.ico"];
  const [slug, setSlug] = useState(initialSlug);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const validate = (val: string) => {
    const s = val.toLowerCase().trim();
    if (!s) {
      setError("Slug cannot be empty");
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(s)) {
      setError("Only lowercase letters, numbers and hyphens allowed");
      return false;
    }
    if (RESERVED.includes(s)) {
      setError(`"${s}" is a reserved path name`);
      return false;
    }
    setError(null);
    return true;
  };

  const handlePublish = async () => {
    if (!validate(slug)) return;
    setIsSubmitting(true);
    try {
      await onConfirm(slug);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fade-in text-white select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Globe size={18} />
            </div>
            <h3 className="text-base font-extrabold">Publish Digital Site</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Choose a unique public web address for your site. Once published, your site will be live instantly across global servers.
        </p>

        {/* Custom Slug Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">Public Web Address</label>
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 overflow-hidden focus-within:border-indigo-500 transition-colors">
            <span className="px-3 text-xs text-slate-500 font-mono bg-slate-900/80 py-3 border-r border-slate-800 select-none whitespace-nowrap">
              {getPublishedBaseLabel()}/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                validate(e.target.value);
              }}
              className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white font-mono focus:outline-none"
              placeholder="my-creative-site"
            />
          </div>

          {error ? (
            <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
              <AlertCircle size={12} /> {error}
            </p>
          ) : (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1 break-all">
              <Check size={12} /> Live URL: {buildPublishedSiteUrl(slug)}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!!error || !slug || isSubmitting}
            onClick={handlePublish}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Globe size={14} />
            <span>{isSubmitting ? "Publishing…" : "Publish Now"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
