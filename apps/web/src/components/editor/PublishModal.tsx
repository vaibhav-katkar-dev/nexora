"use client";

import { useState } from "react";
import {
  X,
  Globe,
  Check,
  AlertCircle,
  ExternalLink,
  Copy,
  QrCode,
  Share2,
  Download,
  CheckCircle2,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getPublishedBaseLabel, buildPublishedSiteUrl } from "@/lib/siteUrl";

interface PublishModalProps {
  initialSlug: string;
  onConfirm: (slug: string) => Promise<string | void>;
  onClose: () => void;
}

export function PublishModal({ initialSlug, onConfirm, onClose }: PublishModalProps) {
  const RESERVED = [
    "dashboard",
    "login",
    "register",
    "editor",
    "admin",
    "api",
    "publish",
    "templates",
    "favicon.ico",
  ];

  const [step, setStep] = useState<1 | 2>(1);
  const [slug, setSlug] = useState(initialSlug || "my-brand");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const toast = useToast();

  const previewUrl = buildPublishedSiteUrl(slug);
  const activeUrl = publishedUrl || previewUrl;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=2&data=${encodeURIComponent(
    activeUrl
  )}`;

  const validate = (val: string) => {
    const s = val.toLowerCase().trim();
    if (!s) {
      setError("Custom username / slug cannot be empty");
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(s)) {
      setError("Only lowercase letters, numbers, and hyphens are allowed");
      return false;
    }
    if (RESERVED.includes(s)) {
      setError(`"${s}" is a reserved system address`);
      return false;
    }
    setError(null);
    return true;
  };

  const handlePublish = async () => {
    if (!validate(slug)) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const resultUrl = await onConfirm(slug);
      const finalUrl = (typeof resultUrl === "string" && resultUrl) ? resultUrl : previewUrl;
      setPublishedUrl(finalUrl);
      setStep(2); // Advance to Step 2: Share & QR Code!
    } catch (err: any) {
      setError(err?.message || "Publish failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeUrl) return;
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    toast.success("Link Copied to Clipboard!", activeUrl);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Official Digital Presence",
          text: `Check out my site: ${activeUrl}`,
          url: activeUrl,
        });
        toast.success("Shared successfully!");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      // Fallback: share to WhatsApp or copy
      const msg = `Check out my site: ${activeUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    }
  };

  const handleDownloadQr = async () => {
    setIsDownloadingQr(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = `${slug || "site"}-qr-code.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

      toast.success("QR Code Downloaded!", "Saved as PNG image to your device.");
    } catch {
      window.open(qrImageUrl, "_blank");
      toast.info("Opened QR Image", "Hold or right-click to save image.");
    } finally {
      setIsDownloadingQr(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 text-white relative overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Ambient Top Glow */}
        <div className="absolute -top-14 -right-14 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                step === 1
                  ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30"
                  : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {step === 1 ? <Globe size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold leading-tight">
                {step === 1 ? "Publish Digital Site" : "🎉 Site Is Live Globally!"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === 1 ? "Step 1 of 2: Set your custom address" : "Step 2 of 2: Share & QR Code"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── STEP 1: Custom Username / Slug Edit & Publish ── */}
        {step === 1 && (
          <div className="space-y-4 relative z-10">
            <p className="text-xs text-slate-300 leading-relaxed">
              Choose your custom username or brand handle. If you already have one, confirm or edit it below before publishing.
            </p>

            {/* Custom Slug Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Custom Web Address (Username)
              </label>
              <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 overflow-hidden focus-within:border-indigo-500 transition-colors shadow-inner">
                <span className="px-3 text-xs text-indigo-400 font-bold font-mono bg-slate-900/80 py-3 border-r border-slate-800 select-none whitespace-nowrap">
                  https://
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    validate(e.target.value);
                  }}
                  className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white font-mono focus:outline-none placeholder-slate-600"
                  placeholder="my-brand"
                  autoFocus
                />
                <span className="px-3 text-xs text-slate-400 font-mono bg-slate-900/80 py-3 border-l border-slate-800 select-none whitespace-nowrap">
                  {getPublishedBaseLabel()}
                </span>
              </div>

              {error ? (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle size={12} className="shrink-0" /> {error}
                </p>
              ) : (
                <div className="flex items-center gap-1.5 mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-emerald-400 font-mono">
                  <Check size={12} className="shrink-0 text-emerald-400" />
                  <span className="truncate">{previewUrl}</span>
                </div>
              )}
            </div>

            {/* Step 1 Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!error || !slug || isSubmitting}
                onClick={handlePublish}
                className="flex-[1.5] py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 touch-manipulation"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing…</span>
                  </>
                ) : (
                  <>
                    <Globe size={14} />
                    <span>Publish Site</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Celebratory Share, Copy Link & QR Code ── */}
        {step === 2 && (
          <div className="space-y-4 relative z-10 animate-fade-in">
            {/* Success Banner */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300">
              <Sparkles size={16} className="text-emerald-400 shrink-0" />
              <span>Your website is published and active worldwide!</span>
            </div>

            {/* Live URL Card with Copy Button */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Live Website Link
              </label>
              <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <span className="font-mono text-xs text-white truncate flex-1 font-semibold">
                  {activeUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Embedded QR Code Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-2.5 bg-white rounded-xl shadow-lg">
                <img
                  src={qrImageUrl}
                  alt="Site QR Code"
                  className="w-36 h-36 object-contain rounded-md"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Scan with any phone camera to visit your live site
              </p>
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={isDownloadingQr}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Download size={13} className="text-indigo-400" />
                <span>{isDownloadingQr ? "Downloading…" : "Download QR Code (PNG)"}</span>
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="py-2.5 px-3 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/50 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Share2 size={13} />
                <span>Share Link</span>
              </button>
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
              >
                <span>Visit Live Site</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Return to Editor */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors"
            >
              Done & Return to Editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
