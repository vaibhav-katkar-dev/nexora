"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Building2,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Upload,
  Layers,
  HelpCircle,
  ExternalLink,
  Loader2,
  Globe,
} from "lucide-react";
import {
  BusinessProfile,
  getSavedBusinessProfile,
  saveBusinessProfile,
  DEFAULT_BUSINESS_PROFILE,
} from "@/lib/businessProfile";
import { mediaApi } from "@/lib/api";

export interface QuickBusinessSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Name of the template being used, or "Blank Canvas" */
  templateName?: string;
  /** Called when user submits the business setup info */
  onSubmit: (profile: BusinessProfile) => void;
  /** Called when user chooses to skip setup directly to editor */
  onSkip: () => void;
  /** Redirecting / creating loader state */
  isSubmitting?: boolean;
  /** Mode: "initial" when starting site, or "edit" when editing from inside editor */
  mode?: "initial" | "edit";
}

const CATEGORIES = [
  { id: "business", label: "Business / Corporate" },
  { id: "portfolio", label: "Portfolio / Creative" },
  { id: "restaurant_menu", label: "Restaurant / Cafe / Food" },
  { id: "digital_card", label: "Digital Business Card" },
  { id: "product_landing", label: "Product Landing" },
  { id: "startup_landing", label: "Tech / Startup" },
  { id: "personal", label: "Personal / Freelancer" },
  { id: "event", label: "Event / Agency" },
  { id: "link_in_bio", label: "Link-in-Bio" },
  { id: "blank", label: "General / Blank" },
];

export function QuickBusinessSetupModal({
  isOpen,
  onClose,
  templateName = "Template",
  onSubmit,
  onSkip,
  isSubmitting = false,
  mode = "initial",
}: QuickBusinessSetupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_BUSINESS_PROFILE);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from saved profile on open
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedBusinessProfile();
      setProfile(saved);
      // Check if saved profile actually has any non-empty useful values
      const hasData = Boolean(
        saved.brandName || saved.phone || saved.email || saved.location || saved.logoUrl
      );
      setHasSavedProfile(hasData);
      setStep(1);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Real-time update helper with sync for whatsapp
  const updateField = (field: keyof BusinessProfile, value: any) => {
    setProfile((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "phone" && prev.whatsappSameAsPhone) {
        next.whatsapp = value;
      }
      if (field === "whatsappSameAsPhone") {
        if (value) next.whatsapp = prev.phone;
      }
      return next;
    });
  };

  // Logo file upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be under 5MB");
      return;
    }

    setIsUploadingLogo(true);
    setUploadError(null);

    try {
      // Try backend upload
      const res = await mediaApi.upload(file);
      const url = res?.url;
      if (url) {
        updateField("logoUrl", url);
      } else {
        throw new Error("No URL returned");
      }
    } catch (err: any) {
      // Fallback: Read as base64 data URL for local guest/offline use
      try {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            updateField("logoUrl", ev.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } catch {
        setUploadError("Failed to upload image. You can also paste an image URL.");
      }
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFinish = () => {
    // Save to persistent storage for all future templates
    saveBusinessProfile(profile);
    onSubmit(profile);
  };

  const handleInstantLaunchWithSaved = () => {
    saveBusinessProfile(profile);
    onSubmit(profile);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        className="bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-950/40 overflow-hidden w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header Bar ── */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Zap size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {mode === "edit" ? "Update Business Profile" : "Quick Site Builder Info"}
                </h3>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px] sm:max-w-xs">
                {templateName ? `Applying to: ${templateName}` : "Auto-fill your digital site"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {mode === "initial" && (
              <button
                type="button"
                onClick={onSkip}
                disabled={isSubmitting}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 px-2.5 py-1.5 rounded-xl transition-colors touch-manipulation"
                title="Skip setup and open editor with default placeholder template"
              >
                Skip ➔
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── Saved Profile Banner (If profile exists) ── */}
        {hasSavedProfile && mode === "initial" && (
          <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 border-b border-emerald-100/80 px-5 sm:px-6 py-2.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
              <Sparkles size={14} className="text-emerald-600 shrink-0" />
              <span className="truncate">
                Auto-filled with your saved profile ({profile.brandName || profile.phone || "Saved info"}).
              </span>
            </div>
            <button
              type="button"
              onClick={handleInstantLaunchWithSaved}
              disabled={isSubmitting}
              className="shrink-0 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-3 py-1 rounded-xl shadow-sm transition-all flex items-center gap-1 touch-manipulation"
            >
              <span>Instant Launch</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* ── Step Progress Indicator ── */}
        <div className="px-5 sm:px-6 pt-3 pb-1 bg-white shrink-0">
          <div className="grid grid-cols-3 gap-2">
            {/* Step 1 Tab */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 1 ? "bg-indigo-600" : "bg-slate-100"
              }`}
              title="Brand & Logo"
            />
            {/* Step 2 Tab */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 2 ? "bg-indigo-600" : "bg-slate-100"
              }`}
              title="Contact & WhatsApp"
            />
            {/* Step 3 Tab */}
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 3 ? "bg-indigo-600" : "bg-slate-100"
              }`}
              title="Location & Launch"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-1.5">
            <span className={step === 1 ? "text-indigo-600" : ""}>1. Brand & Logo</span>
            <span className={step === 2 ? "text-indigo-600" : ""}>2. Contact & WhatsApp</span>
            <span className={step === 3 ? "text-indigo-600" : ""}>3. Location & Launch</span>
          </div>
        </div>

        {/* ── Modal Form Body (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 text-slate-800 scrollbar-thin scrollbar-thumb-slate-200">
          {/* ══════════════════════════════════════════════════════════════════
              STEP 1: BRAND IDENTITY & LOGO
          ══════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={18} className="text-indigo-600" />
                  <span>Brand Identity</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Your business or personal brand name will be placed across the site header, hero, and footer.
                </p>
              </div>

              {/* Brand / Business Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Brand / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                  placeholder="e.g. Apex Digital, Dr. Mehta Clinic, or John Doe"
                  className="w-full h-11 px-3.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all touch-manipulation"
                />
              </div>

              {/* Tagline / Subtitle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  placeholder="e.g. Next-Gen Tech Solutions | Certified Dental Specialist"
                  className="w-full h-11 px-3.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all touch-manipulation"
                />
              </div>

              {/* Business Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Category / Industry
                </label>
                <select
                  value={profile.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full h-11 px-3.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs font-semibold text-slate-900 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all touch-manipulation"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Logo / Brand Avatar */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Brand Logo / Avatar (Optional)
                </label>

                <div className="flex items-center gap-3">
                  {/* Logo Preview */}
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {profile.logoUrl ? (
                      <img
                        src={profile.logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                        onError={() => updateField("logoUrl", "")}
                      />
                    ) : (
                      <span className="text-lg font-black text-indigo-600">
                        {profile.brandName ? profile.brandName.charAt(0).toUpperCase() : "★"}
                      </span>
                    )}
                  </div>

                  {/* Actions: Upload & URL */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="px-3.5 py-2 min-h-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors touch-manipulation"
                      >
                        {isUploadingLogo ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Upload size={13} />
                        )}
                        <span>{isUploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                      </button>

                      {profile.logoUrl && (
                        <button
                          type="button"
                          onClick={() => updateField("logoUrl", "")}
                          className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      value={profile.logoUrl}
                      onChange={(e) => updateField("logoUrl", e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full h-9 px-3 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all touch-manipulation"
                    />
                  </div>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-500 font-medium">{uploadError}</p>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 2: CONTACT & WHATSAPP
          ══════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Phone size={18} className="text-indigo-600" />
                  <span>Contact & Communication</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Connect direct customer calls, inquiries, and 1-click WhatsApp buttons.
                </p>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="e.g. +91 9876543210 or +1 (555) 019-2834"
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all touch-manipulation"
                  />
                </div>
              </div>

              {/* WhatsApp Toggle & Field */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-emerald-950">
                      WhatsApp Chat Button
                    </span>
                  </div>

                  {/* "WhatsApp Same as Phone" Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={profile.whatsappSameAsPhone}
                      onChange={(e) => updateField("whatsappSameAsPhone", e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-emerald-900">
                      Same as phone number
                    </span>
                  </label>
                </div>

                {!profile.whatsappSameAsPhone && (
                  <div className="space-y-1 pt-1 animate-fade-in">
                    <label className="block text-[11px] font-bold text-emerald-900">
                      Dedicated WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={profile.whatsapp}
                      onChange={(e) => updateField("whatsapp", e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full h-10 px-3 bg-white text-xs font-semibold text-slate-900 placeholder-slate-400 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all touch-manipulation"
                    />
                  </div>
                )}
                <p className="text-[10px] text-emerald-800 leading-relaxed">
                  ✦ Injects 1-click floating WhatsApp buttons and pre-filled inquiry chats into your site.
                </p>
              </div>

              {/* Business Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Business / Contact Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="e.g. contact@mybusiness.com"
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all touch-manipulation"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 3: LOCATION & LAUNCH
          ══════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin size={18} className="text-indigo-600" />
                  <span>Location & Summary</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Add your physical city or address for interactive maps and contact sections.
                </p>
              </div>

              {/* Business Location / Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Business Location / Address
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="e.g. Bandra West, Mumbai or 123 Tech Hub Blvd, San Francisco"
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all touch-manipulation"
                  />
                </div>
              </div>

              {/* Primary Call-to-Action Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Main Button Call-to-Action
                </label>
                <input
                  type="text"
                  value={profile.ctaText}
                  onChange={(e) => updateField("ctaText", e.target.value)}
                  placeholder="e.g. Get in Touch / Book Appointment / Order Now"
                  className="w-full h-11 px-3.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all touch-manipulation"
                />
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Summary of Details</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                    Saved for future templates
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>
                    <span className="font-medium text-slate-400 block text-[10px]">Brand:</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {profile.brandName || "(Not set)"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400 block text-[10px]">Phone:</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {profile.phone || "(Not set)"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400 block text-[10px]">WhatsApp:</span>
                    <span className="font-bold text-emerald-700 truncate block">
                      {profile.whatsappSameAsPhone ? profile.phone || "(Same as phone)" : profile.whatsapp || "(Not set)"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400 block text-[10px]">Location:</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {profile.location || "(Not set)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Fixed Footer Action Bar (Android & Mobile Friendly) ── */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          {/* Back button or Skip */}
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              disabled={isSubmitting}
              className="px-4 py-2.5 min-h-[44px] rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 touch-manipulation"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : mode === "initial" ? (
            <button
              type="button"
              onClick={onSkip}
              disabled={isSubmitting}
              className="px-4 py-2.5 min-h-[44px] rounded-2xl border border-slate-200 text-slate-600 hover:text-slate-900 font-bold text-xs hover:bg-slate-50 transition-colors touch-manipulation"
            >
              Skip to Editor
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors touch-manipulation"
            >
              Cancel
            </button>
          )}

          {/* Next or Submit Button */}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="flex-1 sm:flex-none px-6 py-2.5 min-h-[44px] rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all touch-manipulation"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-7 py-2.5 min-h-[44px] rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all touch-manipulation"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Building Site…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>{mode === "edit" ? "Apply to Site" : "Launch Visual Studio"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
