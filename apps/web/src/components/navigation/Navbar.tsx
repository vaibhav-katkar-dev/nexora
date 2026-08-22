"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authApi } from "@/lib/api";
import {
  Globe,
  FolderKanban,
  LayoutTemplate,
  Sparkles,
  Bell,
  Search,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

interface NavbarProps {
  user?: { email: string; role?: string; name?: string } | null;
  onOpenAdminModal?: () => void;
  onOpenAiModal?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export function Navbar({
  user,
  onOpenAdminModal,
  onOpenAiModal,
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const pathname = usePathname();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
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

  const navItems = [
    { label: "My Projects", href: "/dashboard", icon: FolderKanban },
    { label: "Templates", href: "/templates", icon: LayoutTemplate },
    { label: "AI Architect", href: "/ai-builder", icon: Sparkles, action: onOpenAiModal },
  ];

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout errors — clear local state regardless
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const isAdmin = user?.role === "admin";
  const userInitial = (user?.name || user?.email || "U")[0].toUpperCase();
  const userName = user?.name || user?.email?.split("@")[0] || "User";

  const mobileMenuTopClass = "top-14 sm:top-16";

  return (
    <header className="sticky top-0 z-50 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between shadow-sm">

      {/* ── Brand + Desktop Nav ── */}
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm group-hover:bg-indigo-700 transition-colors">
            N
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base hidden sm:inline">
            Oninsite <span className="text-indigo-600 font-semibold">Studio</span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            if (item.action) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className={`group min-h-9 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap touch-manipulation ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-indigo-600 hover:bg-white/60"
                  }`}
                >
                  <IconComp size={13} className={isActive ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-500 transition-colors"} />
                  {item.label}
                </button>
              );
            }

              return (
                <Link
                  key={item.label}
                  href={item.href || "#"}
                  className={`group min-h-9 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap touch-manipulation ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-indigo-600 hover:bg-white/60"
                  }`}
                >
                <IconComp size={13} className={isActive ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-500 transition-colors"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Right: Search + Bell + User ── */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">

        {/* Integrated Search Bar */}
        {onSearchChange && (
          <div className="relative hidden md:block w-44 lg:w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
            />
          </div>
        )}

        {/* Notifications */}
          <button
            type="button"
            className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all min-h-[36px]"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 shrink-0">
              {userInitial}
            </div>
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[80px] truncate">
              {userName}
            </span>
            <ChevronDown size={12} className={`text-slate-400 hidden sm:inline transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in text-xs">
              {/* User info header */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="font-bold text-slate-900 truncate">{user?.name || userName}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    Admin
                  </span>
                )}
              </div>

              {/* Admin Template Manager — admin only */}
              {isAdmin && onOpenAdminModal && (
                <div className="py-1 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenAdminModal();
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-amber-700 hover:bg-amber-50 font-semibold"
                  >
                    <Shield size={13} /> Admin Template Manager
                  </button>
                </div>
              )}

              {/* Sign out */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-semibold"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden active:bg-slate-200 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile Drawer & Backdrop ── */}
      {isMounted && mobileMenuOpen
        ? createPortal(
            <>
              <div
                className="fixed inset-x-0 top-14 sm:top-16 bottom-0 z-[9998] bg-slate-950/55 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div
                className="fixed left-0 right-0 top-14 sm:top-16 z-[9999] max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-white border-b border-slate-200/80 p-3 shadow-[0_30px_90px_rgba(15,23,42,0.28)] lg:hidden flex flex-col gap-1 safe-bottom"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isActiveMobile = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  if (item.action) {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          item.action?.();
                        }}
                        className={`flex items-center gap-3 px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold w-full text-left transition-colors active:scale-[0.99] touch-manipulation ${
                          isActiveMobile
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        <IconComp size={18} /> {item.label}
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.label}
                      href={item.href || "#"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold transition-colors active:scale-[0.99] touch-manipulation ${
                        isActiveMobile
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      <IconComp size={18} /> {item.label}
                    </Link>
                  );
                })}

                {/* Mobile search */}
                {onSearchChange && (
                  <div className="relative mt-1 px-1">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                )}
              </div>
            </>,
            document.body
          )
        : null}
    </header>
  );
}
