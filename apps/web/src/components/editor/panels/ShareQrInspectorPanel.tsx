"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useToast } from "@/components/ui/Toast";
import { buildPublishedSiteUrl } from "@/lib/siteUrl";
import {
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Download,
  Globe,
  MessageCircle,
  Twitter,
  Mail,
  Pencil,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Printer,
} from "lucide-react";

interface ShareQrInspectorPanelProps {
  onOpenSlugModal?: () => void;
}

export function ShareQrInspectorPanel({ onOpenSlugModal }: ShareQrInspectorPanelProps) {
  const { projectSlug, published, projectName } = useEditorStore();
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrSize, setQrSize] = useState<number>(360);
  const toast = useToast();

  const slug = projectSlug || "my-site";
  const liveUrl = buildPublishedSiteUrl(slug);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&margin=2&data=${encodeURIComponent(
    liveUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    toast.success("Live Link Copied!", liveUrl);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: projectName || "My Digital Presence",
          text: `Explore my official site: ${liveUrl}`,
          url: liveUrl,
        });
        toast.success("Shared successfully!");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQr = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = `${slug}-qr-code-${qrSize}x${qrSize}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

      toast.success("QR Code Downloaded!", `Saved ${qrSize}x${qrSize} PNG image.`);
    } catch {
      window.open(qrImageUrl, "_blank");
      toast.info("Opened QR Code", "Right-click or hold to save image.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] text-white select-none overflow-y-auto custom-scrollbar p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-400">
            <QrCode size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">QR Code & Share</h3>
            <p className="text-[11px] text-slate-400">Manage link, QR code & distribution</p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
            published
              ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
              : "bg-amber-950/60 text-amber-400 border-amber-800/60"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              published ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          {published ? "Live" : "Draft"}
        </span>
      </div>

      {/* ── Section 1: Live Link Card ── */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Globe size={11} className="text-indigo-400" />
            <span>Dedicated Website Link</span>
          </label>
          {onOpenSlugModal && (
            <button
              type="button"
              onClick={onOpenSlugModal}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <Pencil size={10} />
              <span>Edit Slug</span>
            </button>
          )}
        </div>

        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-white truncate font-semibold">
            {liveUrl}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
              title="Copy Link"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
            </button>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Open Live Site in New Tab"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Section 2: Quick Social Share Options ── */}
      <div className="space-y-2">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
          One-Tap Sharing
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleNativeShare}
            className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Share2 size={13} className="text-indigo-400" />
            <span>Share Link</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const msg = `Check out my website: ${liveUrl}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
            }}
            className="py-2.5 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-300 hover:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle size={13} className="text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const tweet = `Check out my new website! ${liveUrl}`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, "_blank");
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Twitter size={13} className="text-sky-400" />
            <span>Post on X</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const subject = encodeURIComponent(`Check out my website: ${projectName || slug}`);
              const body = encodeURIComponent(`Hi! Here is the link to my official site: ${liveUrl}`);
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Mail size={13} className="text-amber-400" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* ── Section 3: Digital QR Code Studio ── */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-indigo-400" />
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
              Instant QR Code
            </label>
          </div>
          {/* Resolution toggle */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[9px] font-mono">
            {[
              { label: "Web", size: 250 },
              { label: "HD", size: 360 },
              { label: "Print", size: 600 },
            ].map((opt) => (
              <button
                key={opt.size}
                type="button"
                onClick={() => setQrSize(opt.size)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  qrSize === opt.size
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* QR Preview Card */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="p-3 bg-white rounded-xl shadow-xl transition-transform hover:scale-[1.02]">
            <img
              src={qrImageUrl}
              alt="Live Site QR Code"
              className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-md"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>Scans directly to live site</span>
          </div>
        </div>

        {/* Download QR Action Button */}
        <button
          type="button"
          onClick={handleDownloadQr}
          disabled={isDownloading}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
        >
          <Download size={14} />
          <span>{isDownloading ? "Downloading…" : `Download QR Code (${qrSize}px PNG)`}</span>
        </button>
      </div>

      {/* ── Section 4: Recommended Use Cases ── */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5 text-xs text-slate-400">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
          Where to use your QR code
        </h4>
        <ul className="space-y-1.5 text-[11px] leading-relaxed">
          <li className="flex items-center gap-2">
            <Smartphone size={12} className="text-indigo-400 shrink-0" />
            <span>Instagram, TikTok, and LinkedIn bio & highlights</span>
          </li>
          <li className="flex items-center gap-2">
            <Printer size={12} className="text-emerald-400 shrink-0" />
            <span>Physical business cards, flyers & banners</span>
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-amber-400 shrink-0" />
            <span>Table tent cards, product packaging & invoices</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
