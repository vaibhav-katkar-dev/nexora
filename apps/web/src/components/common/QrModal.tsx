"use client";

import { useState } from "react";
import { X, QrCode, Download, Copy, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  slug?: string;
}

export function QrModal({ isOpen, onClose, url, title, slug }: QrModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrSize, setQrSize] = useState<number>(400);
  const toast = useToast();

  if (!isOpen || !url) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&margin=2&data=${encodeURIComponent(url)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link Copied!", url);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = `${(slug || title || "site").toLowerCase().replace(/[^a-z0-9]/g, "-")}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

      toast.success("QR Code Downloaded!", "PNG file saved to your device.");
    } catch {
      window.open(qrImageUrl, "_blank");
      toast.info("Opened QR Image", "Right-click or hold to save image.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 relative overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-700/40 text-indigo-400">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white leading-tight">Digital QR Code</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[190px]">{title || slug || "Live Site"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* QR Code Container Card */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 relative group">
          <div className="p-3 bg-white rounded-2xl shadow-xl transition-transform group-hover:scale-[1.02]">
            <img
              src={qrImageUrl}
              alt="Live Site QR Code"
              className="w-44 h-44 object-contain rounded-lg"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>Scans directly to live site</span>
          </div>
        </div>

        {/* Live URL Pill */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="text-[11px] font-mono text-slate-300 truncate flex-1 pl-1">{url}</span>
          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Size Selection */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-slate-400">Resolution</span>
          <div className="flex gap-1">
            {[
              { label: "Standard", size: 300 },
              { label: "HD (400px)", size: 400 },
              { label: "Print (800px)", size: 800 },
            ].map((s) => (
              <button
                key={s.size}
                onClick={() => setQrSize(s.size)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  qrSize === s.size
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleDownloadQr}
            disabled={isDownloading}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Download size={14} />
            <span>{isDownloading ? "Saving…" : "Download QR (PNG)"}</span>
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-1 shrink-0"
            title="Open live site in new tab"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
