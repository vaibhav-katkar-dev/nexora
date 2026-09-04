"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

interface PublicHeaderProps {
  onClaimClick?: () => void;
}

export function PublicHeader({ onClaimClick }: PublicHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm shadow-slate-900/[0.06]"
            : "bg-white/80 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px] sm:h-[66px]">
            <Link href="/" className="flex items-center shrink-0 group" aria-label="OkInSite Home">
              <img
                src="https://res.cloudinary.com/usj348ny/image/upload/v1788452134/okinsite.png"
                alt="OkInSite"
                className="h-7 sm:h-8 w-auto object-contain transition-opacity group-hover:opacity-80"
              />
            </Link>

            <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 text-[13.5px] font-medium text-slate-600">
              <Link href="/features" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors">
                Features
              </Link>
              <Link href="/how-it-works" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors">
                How It Works
              </Link>
              <Link href="/templates" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors">
                Templates
              </Link>
              <Link href="/pricing" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors inline-flex items-center gap-1.5">
                Pricing
                <span className="text-[10px] font-bold px-1.5 py-px rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 leading-none">
                  Free
                </span>
              </Link>
              <Link href="/about" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors">
                About
              </Link>
              <Link href="/faq" className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors">
                FAQ
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-xl text-[13px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/90 transition-all duration-150"
              >
                Sign in
              </Link>

              {onClaimClick ? (
                <button
                  onClick={onClaimClick}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 sm:px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white text-[13px] font-semibold shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all duration-150"
                >
                  <span className="hidden sm:inline">Claim Free Site</span>
                  <span className="sm:hidden">Get Started</span>
                  <ArrowRight size={14} className="shrink-0" />
                </button>
              ) : (
                <Link
                  href="/#pricing"
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 sm:px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white text-[13px] font-semibold shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all duration-150"
                >
                  <span className="hidden sm:inline">Claim Free Site</span>
                  <span className="sm:hidden">Get Started</span>
                  <ArrowRight size={14} className="shrink-0" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Navigation Menu"
                className="lg:hidden -mr-1 flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 transition-colors"
              >
                <Menu size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        aria-hidden="true"
        onClick={() => setMobileMenuOpen(false)}
        className={`lg:hidden fixed inset-0 z-[55] bg-slate-950/40 backdrop-blur-[2px] transition-all duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        className={`lg:hidden fixed inset-y-0 right-0 z-[60] w-full max-w-xs bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <img
              src="https://res.cloudinary.com/usj348ny/image/upload/v1788452134/okinsite.png"
              alt="OkInSite"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Mobile Navigation">
          {[
            { label: "Features", href: "/features" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "Templates", href: "/templates" },
            { label: "Pricing", href: "/pricing", badge: "Free" },
            { label: "About", href: "/about" },
            { label: "FAQ", href: "/faq" },
          ].map(({ label, href, badge }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-[15px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <span>{label}</span>
              {badge && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-4 pb-8 pt-3 border-t border-slate-100 space-y-2.5">
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center w-full h-12 rounded-xl text-[14px] font-semibold text-slate-700 border border-slate-200/90 hover:bg-slate-50 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            <span>Claim Your Free Site</span>
            <ArrowRight size={16} />
          </Link>
          <p className="text-center text-[11px] text-slate-400 pt-0.5">
            Free forever · No credit card required
          </p>
        </div>
      </div>
    </>
  );
}
