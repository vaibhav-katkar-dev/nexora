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
  X,
  Check,
  Building2,
  MapPin,
  Phone,
  Mail,
  Upload,
  Loader2,
  Trash2,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
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
    description: "Agencies, consultants, clinics & contractors",
    icon: Briefcase,
    accent: "#4F46E5",
    bg: "#EEF2FF",
    suggestedLinks: ["googleBusiness", "website", "instagram", "linkedin"],
  },
  {
    id: "restaurant",
    label: "Restaurant & Cafe",
    description: "Food menus, cafes, bakeries & catering",
    icon: Utensils,
    accent: "#D97706",
    bg: "#FFFBEB",
    suggestedLinks: ["googleBusiness", "instagram", "website"],
  },
  {
    id: "portfolio",
    label: "Portfolio & Creative",
    description: "Designers, photographers & freelancers",
    icon: Palette,
    accent: "#9333EA",
    bg: "#FAF5FF",
    suggestedLinks: ["instagram", "linkedin", "twitter", "github"],
  },
  {
    id: "store",
    label: "Store & Products",
    description: "E-commerce, retail & digital goods",
    icon: ShoppingBag,
    accent: "#059669",
    bg: "#ECFDF5",
    suggestedLinks: ["instagram", "googleBusiness", "website"],
  },
  {
    id: "personal",
    label: "Personal & Bio Link",
    description: "Creators, influencers & personal brands",
    icon: User,
    accent: "#DC2626",
    bg: "#FFF1F2",
    suggestedLinks: ["instagram", "twitter", "youtube", "linkedin"],
  },
  {
    id: "startup_landing",
    label: "Startup & SaaS",
    description: "Tech products, apps & waitlists",
    icon: Rocket,
    accent: "#0891B2",
    bg: "#ECFEFF",
    suggestedLinks: ["twitter", "linkedin", "github", "website"],
  },
];

function InputField({
  label,
  icon: Icon,
  iconColor,
  required,
  badge,
  ...props
}: {
  label: string;
  icon?: React.ElementType;
  iconColor?: string;
  required?: boolean;
  badge?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={12} style={{ color: iconColor || "#64748B" }} />}
        <label className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
          {label}
          {required && <span className="text-indigo-500 ml-0.5">*</span>}
        </label>
        {badge && (
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700">
            {badge}
          </span>
        )}
      </div>
      <input
        {...props}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
      />
    </div>
  );
}

export function QuickOnboardingModal({
  isOpen,
  onClose,
  defaultName = "",
}: QuickOnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["business"]);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      // lock body scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, defaultName]);

  // Scroll to top on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== catId);
      }
      return [...prev, catId];
    });
  };

  const updateField = (field: keyof BusinessProfile, value: any) => {
    setProfile((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "phone" && prev.whatsappSameAsPhone) next.whatsapp = value;
      if (field === "whatsappSameAsPhone" && value) next.whatsapp = prev.phone;
      return next;
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError("Image must be under 5MB"); return; }
    setIsUploadingLogo(true);
    setUploadError(null);
    try {
      const res = await mediaApi.upload(file);
      if (res?.url) updateField("logoUrl", res.url);
      else throw new Error("No URL");
    } catch {
      try {
        const reader = new FileReader();
        reader.onload = (ev) => { if (ev.target?.result) updateField("logoUrl", ev.target.result as string); };
        reader.readAsDataURL(file);
      } catch {
        setUploadError("Could not process logo. Try pasting an image link instead.");
      }
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isLocalBusiness = selectedCategories.some(
    (c) => c === "business" || c === "restaurant" || c === "store"
  );

  const handleFinish = (skipDetails = false) => {
    const primary = selectedCategories[0] || "business";
    if (!skipDetails) {
      saveBusinessProfile({ ...profile, category: primary, categories: selectedCategories });
    } else {
      saveBusinessProfile({ category: primary, categories: selectedCategories });
    }
    onClose();
    router.push(
      `/templates?category=${encodeURIComponent(primary)}&categories=${encodeURIComponent(selectedCategories.join(","))}&onboarding=true`
    );
  };

  return (
    /* ── Root: fixed full screen, flex column, NO overflow on root ── */
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#F7F8FC" }}
    >
      {/* ── HEADER: fixed height, never scrolls ── */}
      <header
        className="shrink-0 flex items-center justify-between px-5 sm:px-8"
        style={{
          height: 60,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Wordmark */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
          >
            N
          </div>
          <div className="leading-none">
            <div className="text-[13px] font-bold text-slate-900 tracking-tight">Oninsite</div>
            <div className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
              Setup
            </div>
          </div>
        </div>

        {/* Step indicators — desktop */}
        <div className="hidden sm:flex items-center gap-2">
          {[
            { n: 1, label: "Choose Type" },
            { n: 2, label: "Your Details" },
          ].map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className="w-10 h-px"
                  style={{ background: step > 1 ? "#4F46E5" : "#E2E8F0" }}
                />
              )}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                  style={{
                    background:
                      step > n
                        ? "#10B981"
                        : step === n
                        ? "#4F46E5"
                        : "#E2E8F0",
                    color: step >= n ? "#fff" : "#94A3B8",
                  }}
                >
                  {step > n ? <Check size={11} strokeWidth={3} /> : n}
                </div>
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: step === n ? "#1E293B" : "#94A3B8" }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleFinish(true)}
            className="hidden sm:block text-[12px] font-semibold text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Skip →
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={17} />
          </button>
        </div>
      </header>

      {/* ── BODY: the ONE and ONLY scrollable region ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 pb-24">

          {step === 1 ? (
            /* ══ STEP 1: CATEGORIES ══════════════════════════════════════════ */
            <div>
              {/* Title */}
              <div className="mb-8">
                <p className="text-[11px] font-bold text-indigo-500 tracking-widest uppercase mb-2">
                  Step 1 of 2
                </p>
                <h1 className="text-2xl sm:text-[32px] font-extrabold text-slate-900 leading-tight tracking-tight mb-2">
                  What kind of website<br className="hidden sm:block" /> are you building?
                </h1>
                <p className="text-[13px] text-slate-500 leading-relaxed max-w-lg">
                  Pick one or more — we'll personalise your templates and pre-fill your details automatically.
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const sel = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="relative text-left p-4 rounded-2xl border transition-all duration-150 select-none group focus:outline-none"
                      style={{
                        background: sel ? cat.bg : "#fff",
                        borderColor: sel ? cat.accent : "#E2E8F0",
                        boxShadow: sel
                          ? `0 0 0 2px ${cat.accent}30, 0 2px 8px ${cat.accent}12`
                          : "0 1px 3px rgba(0,0,0,0.04)",
                        transform: sel ? "translateY(-1px)" : undefined,
                      }}
                    >
                      {/* Tick badge */}
                      {sel && (
                        <div
                          className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: cat.accent }}
                        >
                          <Check size={10} strokeWidth={3} color="#fff" />
                        </div>
                      )}

                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                        style={{ background: cat.bg }}
                      >
                        <Icon size={20} style={{ color: cat.accent }} />
                      </div>

                      <div
                        className="text-[13px] font-bold mb-0.5"
                        style={{ color: sel ? cat.accent : "#1E293B" }}
                      >
                        {cat.label}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed">
                        {cat.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100">
                <span className="text-[12px] text-slate-400">
                  <span className="font-bold text-slate-700">{selectedCategories.length}</span>
                  {" "}{selectedCategories.length === 1 ? "type" : "types"} selected
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleFinish(true)}
                    className="flex-1 sm:flex-none text-[12px] font-semibold text-slate-400 hover:text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors sm:hidden"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                      boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                    }}
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ══ STEP 2: DETAILS ══════════════════════════════════════════════ */
            <div>
              {/* Title */}
              <div className="mb-8">
                <p className="text-[11px] font-bold text-indigo-500 tracking-widest uppercase mb-2">
                  Step 2 of 2
                </p>
                <h1 className="text-2xl sm:text-[32px] font-extrabold text-slate-900 leading-tight tracking-tight mb-2">
                  Tell us about your brand
                </h1>
                <p className="text-[13px] text-slate-500 leading-relaxed max-w-lg">
                  Every field is optional — fill in what you have and we'll pre-fill your templates instantly.
                </p>
              </div>

              <div className="space-y-5">
                {/* ── Section: Brand Identity ── */}
                <Section label="Brand Identity" icon={Building2}>
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Logo Upload */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-[88px] h-[88px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative"
                        style={{
                          borderColor: profile.logoUrl ? "#4F46E5" : "#CBD5E1",
                          background: profile.logoUrl ? "#EEF2FF" : "#F8FAFC",
                        }}
                        title="Click to upload logo"
                      >
                        {isUploadingLogo ? (
                          <Loader2 size={22} className="animate-spin" style={{ color: "#4F46E5" }} />
                        ) : profile.logoUrl ? (
                          <>
                            <img
                              src={profile.logoUrl}
                              alt="Logo"
                              className="w-full h-full object-contain p-2"
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.45)" }}>
                              Change
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload size={18} className="mb-1 transition-colors" style={{ color: "#94A3B8" }} />
                            <span className="text-[10px] font-semibold text-slate-400">Upload</span>
                          </>
                        )}
                      </div>
                      {profile.logoUrl && (
                        <button
                          type="button"
                          onClick={() => updateField("logoUrl", "")}
                          className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={9} /> Remove
                        </button>
                      )}
                      {uploadError && (
                        <p className="text-[10px] text-rose-500 text-center max-w-[100px]">{uploadError}</p>
                      )}
                      <span className="text-[10px] text-slate-300">or</span>
                    </div>

                    {/* Name, Tagline, Logo URL */}
                    <div className="flex-1 space-y-3 min-w-0">
                      <InputField
                        label="Brand / Your Name"
                        required
                        value={profile.brandName}
                        onChange={(e) => updateField("brandName", e.target.value)}
                        placeholder="e.g. Apex Studio, Maya's Bakery, Dr. Mehta"
                      />
                      <InputField
                        label="Tagline or Headline"
                        value={profile.tagline}
                        onChange={(e) => updateField("tagline", e.target.value)}
                        placeholder="e.g. Handcrafted coffee in the heart of Mumbai"
                      />
                      <InputField
                        label="Logo image link (optional)"
                        type="url"
                        value={profile.logoUrl}
                        onChange={(e) => updateField("logoUrl", e.target.value)}
                        placeholder="https://yoursite.com/logo.png"
                      />
                    </div>
                  </div>
                </Section>

                {/* ── Section: Contact ── */}
                <Section label="Contact & Location" icon={Phone}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField
                      label="Phone Number"
                      icon={Phone}
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" />
                        <label className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase flex-1">
                          WhatsApp Number
                        </label>
                        <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.whatsappSameAsPhone}
                            onChange={(e) => updateField("whatsappSameAsPhone", e.target.checked)}
                            className="rounded border-slate-300 text-indigo-500 focus:ring-0"
                          />
                          Same
                        </label>
                      </div>
                      <input
                        type="tel"
                        disabled={profile.whatsappSameAsPhone}
                        value={profile.whatsapp}
                        onChange={(e) => updateField("whatsapp", e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 disabled:bg-slate-50 disabled:opacity-60 transition-all"
                      />
                    </div>
                    <InputField
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      value={profile.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="hello@yourbrand.com"
                    />
                    <InputField
                      label="City / Location"
                      icon={MapPin}
                      value={profile.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="Bandra West, Mumbai"
                    />
                  </div>
                </Section>

                {/* ── Section: Links ── */}
                <Section
                  label="Social Media & Profile Links"
                  icon={Share2}
                  badge="All optional"
                >
                  {isLocalBusiness && (
                    <div
                      className="mb-4 p-4 rounded-xl space-y-2"
                      style={{
                        background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={13} style={{ color: "#D97706" }} />
                        <span className="text-[12px] font-bold text-slate-800">
                          Google Business / Maps Review Link
                        </span>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: "#FDE68A", color: "#92400E" }}
                        >
                          Local SEO
                        </span>
                      </div>
                      <input
                        type="url"
                        value={profile.googleBusiness || ""}
                        onChange={(e) => updateField("googleBusiness", e.target.value)}
                        placeholder="https://g.page/r/your-business or Google Maps link"
                        className="w-full px-3.5 py-2.5 bg-white border border-amber-200 rounded-xl text-[12px] font-mono text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all"
                      />
                      <p className="text-[11px] text-amber-700/80">
                        Connects your visitors directly to your Google location and reviews.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField
                      label="Instagram"
                      icon={Instagram}
                      iconColor="#E1306C"
                      value={profile.instagram || ""}
                      onChange={(e) => updateField("instagram", e.target.value)}
                      placeholder="@yourhandle"
                    />
                    <InputField
                      label="LinkedIn"
                      icon={Linkedin}
                      iconColor="#0A66C2"
                      value={profile.linkedin || ""}
                      onChange={(e) => updateField("linkedin", e.target.value)}
                      placeholder="linkedin.com/in/username"
                    />
                    <InputField
                      label="Twitter / X"
                      icon={Twitter}
                      iconColor="#0F1419"
                      value={profile.twitter || ""}
                      onChange={(e) => updateField("twitter", e.target.value)}
                      placeholder="@username"
                    />
                    <InputField
                      label="YouTube or Website"
                      icon={Youtube}
                      iconColor="#FF0000"
                      value={profile.youtube || profile.website || ""}
                      onChange={(e) => {
                        updateField("youtube", e.target.value);
                        updateField("website", e.target.value);
                      }}
                      placeholder="youtube.com/@channel or yoursite.com"
                    />
                  </div>
                </Section>
              </div>

              {/* Step 2 Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft size={13} /> Back
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleFinish(true)}
                    className="flex-1 sm:flex-none text-[12px] font-semibold text-slate-400 hover:text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Skip for now →
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinish(false)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                      boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                    }}
                  >
                    Find My Templates <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Reusable Section card ── */
function Section({
  label,
  icon: Icon,
  badge,
  children,
}: {
  label: string;
  icon: React.ElementType;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center gap-2 mb-4 pb-3.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#EEF2FF" }}
        >
          <Icon size={14} style={{ color: "#4F46E5" }} />
        </div>
        <span className="text-[13px] font-bold text-slate-800">{label}</span>
        {badge && (
          <span className="ml-auto text-[10px] font-semibold text-slate-400">{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}
