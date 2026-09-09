"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Globe,
  Building2,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Upload,
  Loader2,
  Navigation,
} from "lucide-react";
import {
  BusinessProfile,
  getSavedBusinessProfile,
  saveBusinessProfile,
  DEFAULT_BUSINESS_PROFILE,
} from "@/lib/businessProfile";
import { mediaApi } from "@/lib/api";
import { detectAutoLocation } from "@/lib/geoLocation";

export const QUICK_SETUP_DONT_SHOW_KEY = "okinsite:quick-setup:dont-show";

export function shouldShowQuickBusinessSetup(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(QUICK_SETUP_DONT_SHOW_KEY) !== "true";
}

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
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_BUSINESS_PROFILE);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleAutoLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);
    try {
      const result = await detectAutoLocation();
      updateField("location", result.formattedAddress);
      setLocationSuccess(true);
      setTimeout(() => setLocationSuccess(false), 3000);
    } catch (err: any) {
      setLocationError(err?.message || "Could not detect location.");
      setTimeout(() => setLocationError(null), 5000);
    } finally {
      setIsDetectingLocation(false);
    }
  };

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
      setDontShowAgain(window.localStorage.getItem(QUICK_SETUP_DONT_SHOW_KEY) === "true");
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
    if (dontShowAgain) window.localStorage.setItem(QUICK_SETUP_DONT_SHOW_KEY, "true");
    onSubmit(profile);
  };

  const handleInstantLaunchWithSaved = () => {
    saveBusinessProfile(profile);
    if (dontShowAgain) window.localStorage.setItem(QUICK_SETUP_DONT_SHOW_KEY, "true");
    onSubmit(profile);
  };

  const handleSkip = () => {
    if (dontShowAgain) window.localStorage.setItem(QUICK_SETUP_DONT_SHOW_KEY, "true");
    onSkip();
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
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {mode === "edit" ? "Edit Website Details" : "Set Up Your Website"}
              </h3>
              <p className="text-xs text-slate-500">
                {templateName ? `Template: ${templateName}` : "Personalise basic brand and contact details"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === "initial" && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg transition-colors"
                title="Skip and open editor directly"
              >
                Skip
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

        {/* ── Saved Profile Banner (Fast Path) ── */}
        {hasSavedProfile && mode === "initial" && (
          <div className="bg-emerald-50/80 border-b border-emerald-100 px-5 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium truncate">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span className="truncate">
                Pre-filled with saved profile ({profile.brandName || profile.phone || "Saved info"}).
              </span>
            </div>
            <button
              type="button"
              onClick={handleInstantLaunchWithSaved}
              disabled={isSubmitting}
              className="shrink-0 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-3 py-1 rounded-lg shadow-xs transition-all flex items-center gap-1"
            >
              <span>Continue</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* ── Modal Form Body (Scrollable, Single View) ── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5 text-slate-800 scrollbar-thin scrollbar-thumb-slate-200">
          {/* Section 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Building2 size={14} className="text-indigo-600" />
              <span>Brand Identity</span>
            </div>

            {/* Brand / Business Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Brand or Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profile.brandName}
                onChange={(e) => updateField("brandName", e.target.value)}
                placeholder="e.g. Apex Digital, Dr. Mehta, or The Daily Roast"
                className="w-full h-10 px-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Tagline / Catchphrase */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">
                Tagline or Description <span className="text-slate-400 text-[10px]">(Optional)</span>
              </label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder="e.g. Modern Architecture Studio | Handcrafted Coffee"
                className="w-full h-9 px-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Section 2: Contact & WhatsApp */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">
              <Phone size={14} className="text-indigo-600" />
              <span>Contact & Communication</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full h-9 px-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Business Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="contact@mybrand.com"
                  className="w-full h-9 px-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* WhatsApp Integration Box */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950">
                  <MessageSquare size={14} className="text-emerald-600" />
                  <span>WhatsApp Chat Button</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-emerald-900 select-none">
                  <input
                    type="checkbox"
                    checked={profile.whatsappSameAsPhone}
                    onChange={(e) => updateField("whatsappSameAsPhone", e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Same as phone</span>
                </label>
              </div>

              {!profile.whatsappSameAsPhone && (
                <input
                  type="tel"
                  value={profile.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="WhatsApp number (e.g. +91 9876543210)"
                  className="w-full h-8 px-2.5 bg-white text-xs font-medium text-slate-900 rounded-lg border border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              )}
            </div>
          </div>

          {/* Section 3: Location & Logo (Optional) */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">
              <MapPin size={14} className="text-indigo-600" />
              <span>Location & Logo (Optional)</span>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-600">
                  City / Address
                </label>
                <button
                  type="button"
                  onClick={handleAutoLocation}
                  disabled={isDetectingLocation}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors"
                  title="Detect your current location automatically"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : locationSuccess ? (
                    <>
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      <span className="text-emerald-600">Detected!</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={11} />
                      <span>Auto Detect</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. Bandra West, Mumbai or New York, NY"
                className="w-full h-9 px-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
              {locationError && (
                <p className="text-[10px] text-amber-600">{locationError}</p>
              )}
            </div>

            {/* Logo Upload Row */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">
                Logo or Avatar
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {profile.logoUrl ? (
                    <img
                      src={profile.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover"
                      onError={() => updateField("logoUrl", "")}
                    />
                  ) : (
                    <ImageIcon size={16} className="text-slate-400" />
                  )}
                </div>

                <div className="flex items-center gap-2 flex-1">
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
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    {isUploadingLogo ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    <span>{isUploadingLogo ? "Uploading..." : "Upload"}</span>
                  </button>

                  <input
                    type="url"
                    value={profile.logoUrl}
                    onChange={(e) => updateField("logoUrl", e.target.value)}
                    placeholder="Or paste image link"
                    className="flex-1 h-8 px-2.5 bg-slate-50 focus:bg-white text-xs text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                  />

                  {profile.logoUrl && (
                    <button
                      type="button"
                      onClick={() => updateField("logoUrl", "")}
                      className="text-[11px] text-rose-500 hover:underline px-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {uploadError && (
                <p className="text-[11px] text-rose-500">{uploadError}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Fixed Footer Action Bar ── */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
            {mode === "initial" ? (
              <button
                type="button"
                onClick={handleSkip}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Skip for now
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
          )}
            {mode === "initial" && (
              <label className="flex items-center gap-2 text-[11px] font-medium text-slate-500 select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Don't show again</span>
              </label>
            )}
          <button
            type="button"
            onClick={handleFinish}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Opening Studio…</span>
              </>
            ) : (
              <>
                <span>{mode === "edit" ? "Save Changes" : "Apply & Open Editor"}</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
