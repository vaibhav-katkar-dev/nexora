"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Globe, Phone, Mail, Check, Sparkles } from "lucide-react";

interface LinkBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl?: string;
  onSave: (url: string) => void;
  title?: string;
}

type Mode = "whatsapp" | "url" | "phone" | "email";

export function LinkBuilderModal({
  isOpen,
  onClose,
  currentUrl = "",
  onSave,
  title = "Configure Button & Link Action",
}: LinkBuilderModalProps) {
  const [mode, setMode] = useState<Mode>("whatsapp");

  // WhatsApp fields
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // Other mode fields
  const [customUrl, setCustomUrl] = useState("");
  const [telNumber, setTelNumber] = useState("");
  const [emailAddr, setEmailAddr] = useState("");
  const [emailSubject, setEmailSubject] = useState("");

  // Parse existing URL on mount / open
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = currentUrl.trim();
    if (trimmed.includes("wa.me") || trimmed.includes("whatsapp.com")) {
      setMode("whatsapp");
      try {
        const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
        const pathNum = urlObj.pathname.replace(/[^0-9]/g, "");
        const textParam = urlObj.searchParams.get("text") || "";
        setPhone(pathNum);
        setMessage(textParam);
      } catch {
        setPhone(trimmed.replace(/[^0-9]/g, ""));
      }
    } else if (trimmed.startsWith("tel:")) {
      setMode("phone");
      setTelNumber(trimmed.replace("tel:", ""));
    } else if (trimmed.startsWith("mailto:")) {
      setMode("email");
      const mailStr = trimmed.replace("mailto:", "");
      const [emailPart, queryPart] = mailStr.split("?");
      setEmailAddr(emailPart || "");
      if (queryPart) {
        const params = new URLSearchParams(queryPart);
        setEmailSubject(params.get("subject") || "");
      }
    } else {
      setMode(trimmed ? "url" : "whatsapp");
      setCustomUrl(trimmed);
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  // Build final URL based on active tab
  const getGeneratedUrl = (): string => {
    if (mode === "whatsapp") {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      if (!cleanPhone) return "";
      const encodedMsg = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
      return `https://wa.me/${cleanPhone}${encodedMsg}`;
    }

    if (mode === "phone") {
      const cleanTel = telNumber.replace(/[^0-9+]/g, "");
      return cleanTel ? `tel:${cleanTel}` : "";
    }

    if (mode === "email") {
      if (!emailAddr.trim()) return "";
      const subj = emailSubject.trim() ? `?subject=${encodeURIComponent(emailSubject.trim())}` : "";
      return `mailto:${emailAddr.trim()}${subj}`;
    }

    return customUrl.trim();
  };

  const handleApply = () => {
    const finalUrl = getGeneratedUrl();
    if (finalUrl) {
      onSave(finalUrl);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <MessageCircle size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">Setup 1-click WhatsApp message or link target</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 p-1.5 m-4 bg-slate-950 rounded-xl border border-slate-800 gap-1 text-xs font-medium">
          <button
            onClick={() => setMode("whatsapp")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === "whatsapp"
                ? "bg-emerald-600 text-white font-semibold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MessageCircle size={13} />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => setMode("url")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === "url"
                ? "bg-indigo-600 text-white font-semibold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe size={13} />
            <span>URL</span>
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === "phone"
                ? "bg-blue-600 text-white font-semibold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Phone size={13} />
            <span>Call</span>
          </button>
          <button
            onClick={() => setMode("email")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === "email"
                ? "bg-violet-600 text-white font-semibold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Mail size={13} />
            <span>Email</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 pb-5 space-y-4">
          {/* 💬 WHATSAPP TAB */}
          {mode === "whatsapp" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Sparkles size={13} />
                  <span>WhatsApp Direct Message Link</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When visitors click this button, it automatically opens WhatsApp with your number and pre-filled message!
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  WhatsApp Phone Number (with Country Code)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 919967812345 or +1 234 567 8900"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Include country code without spaces or dashes (e.g. 91 for India, 1 for US/Canada).
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Pre-filled Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Hi! I saw your website and would like to inquire about your services."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* 🌐 CUSTOM URL TAB */}
          {mode === "url" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Web Address / URL
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com or #section-id"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* 📞 PHONE TAB */}
          {mode === "phone" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number to Call
                </label>
                <input
                  type="text"
                  value={telNumber}
                  onChange={(e) => setTelNumber(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* ✉️ EMAIL TAB */}
          {mode === "email" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailAddr}
                  onChange={(e) => setEmailAddr(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Default Subject (Optional)
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Inquiry from website"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          {/* Generated URL Preview */}
          {getGeneratedUrl() && (
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-400 font-mono">Result:</span>
              <span className="text-indigo-300 font-mono truncate max-w-[280px]">{getGeneratedUrl()}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!getGeneratedUrl()}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Check size={14} />
              <span>Apply Button Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
