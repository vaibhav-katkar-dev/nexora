"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Utensils,
  Palette,
  ShoppingBag,
  User,
  Rocket,
  ArrowRight,
  Sparkles,
  X,
  Check,
  Building2,
  MapPin,
  Phone,
} from "lucide-react";
import {
  BusinessProfile,
  getSavedBusinessProfile,
  saveBusinessProfile,
} from "@/lib/businessProfile";

interface QuickOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
}

const CATEGORIES = [
  {
    id: "business",
    label: "Business & Services",
    description: "Agencies, consultants, salons, clinics & contractors",
    icon: Briefcase,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "restaurant",
    label: "Restaurant & Cafe",
    description: "Food menus, cafes, bakeries, bars & catering",
    icon: Utensils,
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "portfolio",
    label: "Portfolio & Creative",
    description: "Designers, photographers, artists, developers & resumes",
    icon: Palette,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "store",
    label: "Store & Products",
    description: "E-commerce, physical products, digital goods & retail",
    icon: ShoppingBag,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "personal",
    label: "Personal & Link in Bio",
    description: "Creators, freelancers, influencers & personal profiles",
    icon: User,
    color: "from-rose-500 to-red-600",
  },
  {
    id: "startup_landing",
    label: "Startup & SaaS",
    description: "Apps, tech products, landing pages & pre-launches",
    icon: Rocket,
    color: "from-cyan-500 to-blue-600",
  },
];

export function QuickOnboardingModal({
  isOpen,
  onClose,
  defaultName = "",
}: QuickOnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("business");

  const [profile, setProfile] = useState<BusinessProfile>(() => {
    const saved = getSavedBusinessProfile();
    return {
      ...saved,
      brandName: saved.brandName || defaultName || "",
      category: saved.category || "business",
    };
  });

  if (!isOpen) return null;

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setProfile((prev) => ({ ...prev, category: catId }));
    setStep(2);
  };

  const handleFinishAndShowTemplates = (skipProfile = false) => {
    if (!skipProfile) {
      saveBusinessProfile({
        ...profile,
        category: selectedCategory,
      });
    } else {
      saveBusinessProfile({
        category: selectedCategory,
      });
    }

    onClose();
    router.push(`/templates?category=${encodeURIComponent(selectedCategory)}&onboarding=true`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {step === 1 ? "What type of website do you need?" : "Personalize Your Website"}
              </h2>
              <p className="text-xs text-slate-500">
                {step === 1
                  ? "Select a category to see hand-picked designs for your goal."
                  : "We'll automatically set up your templates with your brand info."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            /* STEP 1: Category Picker */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all group ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20"
                          : "border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50/80 hover:shadow-xs"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-sm font-bold text-slate-900">
                            {cat.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                          {cat.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleFinishAndShowTemplates(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Skip and view all templates →
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Quick Brand Prefill Form */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                <span className="font-semibold">
                  Selected Category:{" "}
                  <strong className="text-indigo-700 capitalize">
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Change Category
                </button>
              </div>

              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Brand or Website Name <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={profile.brandName}
                    onChange={(e) => setProfile((p) => ({ ...p, brandName: e.target.value }))}
                    placeholder="e.g. Apex Design Studio, Maya's Bakery, Dr. Rao"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tagline / Short Description
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))}
                  placeholder="e.g. Handcrafted sourdough & artisanal coffee in Mumbai"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp / Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Phone / WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* City / Location */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    City / Location
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Mumbai, India"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleFinishAndShowTemplates(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Skip details for now →
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinishAndShowTemplates(false)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
                  >
                    Show Matching Templates <ArrowRight size={14} />
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
