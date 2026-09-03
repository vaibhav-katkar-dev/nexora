"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Utensils,
  Palette,
  ShoppingBag,
  User,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
  Check,
  Building2,
  MapPin,
  Phone,
  Mail,
  Upload,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  Share2,
} from "lucide-react";
import {
  BusinessProfile,
  getSavedBusinessProfile,
  saveBusinessProfile,
} from "@/lib/businessProfile";
import { mediaApi } from "@/lib/api";

interface QuickOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
}

const CATEGORIES = [
  {
    id: "business",
    label: "Business & Services",
    description: "Agencies, consultants, salons, clinics, finance & contractors",
    icon: Briefcase,
    color: "from-blue-500 to-indigo-600",
    suggestedLinks: ["googleBusiness", "website", "instagram", "linkedin"],
  },
  {
    id: "restaurant",
    label: "Restaurant & Cafe",
    description: "Dining, food menus, cafes, bakeries, bars & catering",
    icon: Utensils,
    color: "from-amber-500 to-orange-600",
    suggestedLinks: ["googleBusiness", "instagram", "website"],
  },
  {
    id: "portfolio",
    label: "Portfolio & Creative",
    description: "Designers, photographers, artists, developers & freelance resumes",
    icon: Palette,
    color: "from-purple-500 to-pink-600",
    suggestedLinks: ["instagram", "linkedin", "twitter", "github"],
  },
  {
    id: "store",
    label: "Store & Products",
    description: "E-commerce, direct sales, physical products, digital goods & retail",
    icon: ShoppingBag,
    color: "from-emerald-500 to-teal-600",
    suggestedLinks: ["instagram", "googleBusiness", "website"],
  },
  {
    id: "personal",
    label: "Personal & Bio Link",
    description: "Creators, influencers, personal brands & link-in-bio profiles",
    icon: User,
    color: "from-rose-500 to-red-600",
    suggestedLinks: ["instagram", "twitter", "youtube", "linkedin"],
  },
  {
    id: "startup_landing",
    label: "Startup & SaaS",
    description: "Tech products, software, mobile apps & high-conversion waitlists",
    icon: Rocket,
    color: "from-cyan-500 to-blue-600",
    suggestedLinks: ["twitter", "linkedin", "github", "website"],
  },
];

export function QuickOnboardingModal({
  isOpen,
  onClose,
  defaultName = "",
}: QuickOnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["business"]);

  const [profile, setProfile] = useState<BusinessProfile>(() => {
    const saved = getSavedBusinessProfile();
    return {
      ...saved,
      brandName: saved.brandName || defaultName || "",
      category: saved.category || "business",
      categories: saved.categories || ["business"],
    };
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedBusinessProfile();
      setProfile({
        ...saved,
        brandName: saved.brandName || defaultName || "",
      });
      if (saved.categories && saved.categories.length > 0) {
        setSelectedCategories(saved.categories);
      }
    }
  }, [isOpen, defaultName]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Toggle multi-select categories
  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        // Keep at least 1 category selected
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const updateField = (field: keyof BusinessProfile, value: any) => {
    setProfile((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "phone" && prev.whatsappSameAsPhone) {
        next.whatsapp = value;
      }
      if (field === "whatsappSameAsPhone" && value) {
        next.whatsapp = prev.phone;
      }
      return next;
    });
  };

  // Logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB");
      return;
    }

    setIsUploadingLogo(true);
    setUploadError(null);

    try {
      const res = await mediaApi.upload(file);
      if (res?.url) {
        updateField("logoUrl", res.url);
      } else {
        throw new Error("No URL returned");
      }
    } catch {
      try {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            updateField("logoUrl", ev.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } catch {
        setUploadError("Could not process logo. You can also paste an image link.");
      }
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isBusinessOrRestaurant = selectedCategories.some(
    (c) => c === "business" || c === "restaurant" || c === "store"
  );

  const handleFinish = (skipDetails = false) => {
    const primaryCategory = selectedCategories[0] || "business";
    const finalProfile: BusinessProfile = {
      ...profile,
      category: primaryCategory,
      categories: selectedCategories,
    };

    if (!skipDetails) {
      saveBusinessProfile(finalProfile);
    } else {
      saveBusinessProfile({
        category: primaryCategory,
        categories: selectedCategories,
      });
    }

    onClose();
    const catQuery = encodeURIComponent(primaryCategory);
    const multiQuery = encodeURIComponent(selectedCategories.join(","));
    router.push(`/templates?category=${catQuery}&categories=${multiQuery}&onboarding=true`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col select-none overflow-hidden animate-fade-in font-sans">
      {/* ── Fixed Top Navigation Bar ────────────────────────────────────────── */}
      <header className="h-16 px-6 sm:px-10 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0 z-20">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-center font-black text-base shadow-sm">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm tracking-tight">Oninsite</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Setup Studio</span>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === 1 ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"
              }`}
            >
              {step === 1 ? "1" : <Check size={14} strokeWidth={3} />}
            </div>
            <span className={`text-xs font-bold ${step === 1 ? "text-slate-900" : "text-slate-500"}`}>
              Select Categories
            </span>
          </div>

          <div className="w-8 h-[2px] bg-slate-200" />

          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              2
            </div>
            <span className={`text-xs font-bold ${step === 2 ? "text-slate-900" : "text-slate-400"}`}>
              Brand Details & Links
            </span>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleFinish(true)}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Skip to Templates →
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ── Main Scrollable Canvas ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-6 py-8 sm:py-12">
          {step === 1 ? (
            /* ═══════════════════════════════════════════════════════════════════ */
            /* STEP 1: MULTI-SELECT CATEGORIES                                   */
            /* ═══════════════════════════════════════════════════════════════════ */
            <div className="space-y-8 animate-fade-in">
              {/* Header Titles */}
              <div className="text-center max-w-xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
                  <Sparkles size={13} /> Step 1 of 2
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  What kind of website are you creating?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Select all categories that describe your project. We'll tailor design recommendations and layout options for you.
                </p>
              </div>

              {/* Multi-Select Category Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategories.includes(cat.id);

                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group select-none ${
                        isSelected
                          ? "border-indigo-600 bg-white ring-2 ring-indigo-500/30 shadow-md translate-y-[-2px]"
                          : "border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-xs hover:translate-y-[-1px]"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-sm`}
                          >
                            <Icon size={22} />
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-300 bg-slate-50 group-hover:border-indigo-400"
                            }`}
                          >
                            {isSelected && <Check size={13} strokeWidth={3} />}
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mb-1">
                          {cat.label}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-indigo-50 text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                          <Check size={12} strokeWidth={2.5} /> Selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sticky Action Footer */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
                <div className="text-xs text-slate-500 font-semibold">
                  <span className="font-extrabold text-indigo-600">{selectedCategories.length}</span>{" "}
                  {selectedCategories.length === 1 ? "category" : "categories"} selected
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleFinish(true)}
                    className="flex-1 sm:flex-none text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Skip setup & show templates →
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Continue to Info & Links <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════════════ */
            /* STEP 2: DETAILS, LOGO & SOCIAL/GOOGLE LINKS                        */
            /* ═══════════════════════════════════════════════════════════════════ */
            <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
              {/* Header Titles */}
              <div className="text-center max-w-xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
                  <Sparkles size={13} /> Step 2 of 2
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Tell us a bit about your brand
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Fill in what you have now. We'll pre-fill your templates automatically so your website is ready to launch in seconds.
                </p>
              </div>

              {/* Form Cards Grid */}
              <div className="space-y-6">
                {/* ── CARD 1: Core Brand & Logo ── */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Building2 size={18} className="text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900">Brand Identity</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                    {/* Logo Upload Box */}
                    <div className="space-y-2 flex flex-col items-center text-center">
                      <label className="block text-xs font-bold text-slate-700">Logo or Avatar</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group"
                        title="Click to upload logo"
                      >
                        {isUploadingLogo ? (
                          <Loader2 size={24} className="animate-spin text-indigo-600" />
                        ) : profile.logoUrl ? (
                          <>
                            <img
                              src={profile.logoUrl}
                              alt="Logo preview"
                              className="w-full h-full object-contain p-1.5"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                              Change
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="text-slate-400 group-hover:text-indigo-600 mb-1" />
                            <span className="text-[10px] font-semibold text-slate-500 group-hover:text-indigo-600">
                              Upload Logo
                            </span>
                          </>
                        )}
                      </div>

                      {profile.logoUrl && (
                        <button
                          type="button"
                          onClick={() => updateField("logoUrl", "")}
                          className="text-[10px] font-semibold text-rose-500 hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={10} /> Remove
                        </button>
                      )}
                    </div>

                    {/* Brand Name & Tagline */}
                    <div className="sm:col-span-2 space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Brand / Business / Your Name <span className="text-indigo-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={profile.brandName}
                          onChange={(e) => updateField("brandName", e.target.value)}
                          placeholder="e.g. Apex Design Studio, Maya's Bakery, Dr. Mehta"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Short Tagline / Headline
                        </label>
                        <input
                          type="text"
                          value={profile.tagline}
                          onChange={(e) => updateField("tagline", e.target.value)}
                          placeholder="e.g. Handcrafted pastries & specialty coffee in Mumbai"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                      </div>

                      {/* Or image link */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-slate-400">
                          Or paste logo image link (optional)
                        </label>
                        <input
                          type="url"
                          value={profile.logoUrl}
                          onChange={(e) => updateField("logoUrl", e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CARD 2: Contact & Location ── */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Phone size={18} className="text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900">Direct Contact & WhatsApp</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">WhatsApp Number</label>
                        <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.whatsappSameAsPhone}
                            onChange={(e) => updateField("whatsappSameAsPhone", e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                          />
                          Same as phone
                        </label>
                      </div>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          disabled={profile.whatsappSameAsPhone}
                          value={profile.whatsapp}
                          onChange={(e) => updateField("whatsapp", e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white disabled:opacity-60 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Email Address</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="hello@yourbrand.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">City / Physical Location</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={profile.location}
                          onChange={(e) => updateField("location", e.target.value)}
                          placeholder="e.g. Bandra West, Mumbai"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CARD 3: Smart Social & Google Business Links ── */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Share2 size={18} className="text-indigo-600" />
                      <h2 className="text-sm font-bold text-slate-900">Social Media & Business Profiles</h2>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">All optional</span>
                  </div>

                  {/* Highlight Google Business Profile if Business or Restaurant */}
                  {isBusinessOrRestaurant && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-200/70 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-amber-600" />
                        <span className="text-xs font-bold text-slate-900">
                          Google Business / Maps Review Link
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/80 text-amber-900">
                          Recommended for Local SEO
                        </span>
                      </div>
                      <input
                        type="url"
                        value={profile.googleBusiness || ""}
                        onChange={(e) => updateField("googleBusiness", e.target.value)}
                        placeholder="https://g.page/r/your-business or Google Maps share link"
                        className="w-full px-3.5 py-2 bg-white border border-amber-300/80 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[11px] text-slate-500">
                        Links your visitors directly to your Google location and customer reviews!
                      </p>
                    </div>
                  )}

                  {/* Social Profile Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Instagram */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Instagram size={13} className="text-pink-500" /> Instagram Profile
                      </label>
                      <input
                        type="text"
                        value={profile.instagram || ""}
                        onChange={(e) => updateField("instagram", e.target.value)}
                        placeholder="@yourhandle or instagram.com/brand"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Linkedin size={13} className="text-blue-600" /> LinkedIn Profile
                      </label>
                      <input
                        type="text"
                        value={profile.linkedin || ""}
                        onChange={(e) => updateField("linkedin", e.target.value)}
                        placeholder="linkedin.com/in/username or /company/brand"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Twitter / X */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Twitter size={13} className="text-slate-800" /> Twitter / X Handle
                      </label>
                      <input
                        type="text"
                        value={profile.twitter || ""}
                        onChange={(e) => updateField("twitter", e.target.value)}
                        placeholder="@username or x.com/brand"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* YouTube / Website */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Youtube size={13} className="text-red-600" /> YouTube or Website
                      </label>
                      <input
                        type="text"
                        value={profile.youtube || profile.website || ""}
                        onChange={(e) => {
                          updateField("youtube", e.target.value);
                          updateField("website", e.target.value);
                        }}
                        placeholder="youtube.com/@channel or current website"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Footer */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Categories
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleFinish(true)}
                    className="flex-1 sm:flex-none text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Skip details for now →
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinish(false)}
                    className="flex-1 sm:flex-none px-7 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Find My Matching Templates <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

