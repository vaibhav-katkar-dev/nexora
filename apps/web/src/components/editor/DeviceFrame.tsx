"use client";

import { ReactNode, useEffect, useRef } from "react";

/**
 * DeviceFrame
 * ─────────────────────────────────────────────────────────────────────────
 * Renders the site content inside an accurate, realistic device shell for
 * the visual editor's viewport switcher (Desktop / Tablet / Android Phone).
 *
 * Unlike the old implementation (which just changed the width of a single
 * tall scrolling column), each device frame here:
 *   • Renders genuine device chrome (bezel, status bar, nav bar, browser UI).
 *   • Scrolls the SITE content INSIDE the screen — the outer canvas stays
 *     fixed and only the device "screen" scrolls, exactly like a real device.
 *   • Uses realistic dimensions so the Android view actually looks like a
 *     modern Android phone (punch-hole camera, status bar, 3-button nav bar).
 *
 * Children (the <SiteRenderer>) are mounted inside an absolutely-positioned
 * screen area that is the scroll container. Scroll-driven features in
 * CanvasPreview scroll this same container.
 */

export type DeviceFrameViewport = "desktop" | "tablet" | "mobile";

interface DeviceFrameProps {
  viewport: DeviceFrameViewport;
  children: ReactNode;
  /** Forwarded ref so the parent can scroll-to-section inside the screen. */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export function DeviceFrame({ viewport, children, scrollRef }: DeviceFrameProps) {
  // ── Desktop: modern browser window ─────────────────────────────────────
  if (viewport === "desktop") {
    return (
      <div className="w-full h-full flex flex-col items-stretch justify-stretch p-1 sm:p-2 lg:p-3 overflow-hidden min-h-[400px]">
        <div className="w-full h-full min-h-0 flex flex-col rounded-[1.25rem] border border-slate-700/80 bg-slate-900/70 shadow-2xl overflow-hidden">
          {/* Browser title bar */}
          <div className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-slate-800/80 bg-slate-800/90 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-md px-3 py-1 text-[11px] text-slate-300 font-mono max-w-md w-full">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-emerald-400 shrink-0">
                  <path d="M12 2C7 2 3 6 3 11c0 5.5 7 11 7 11s2-1.5 4-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>https://your-site.com</span>
              </div>
            </div>
            <div className="w-8" />
          </div>

          {/* Browser content — scrolls inside here */}
          <div
            ref={scrollRef as React.RefObject<HTMLDivElement>}
            className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden flex flex-col custom-scrollbar"
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  // ── Tablet: realistic tablet shell ─────────────────────────────────────
  if (viewport === "tablet") {
    return (
      <div className="flex flex-col items-center justify-center p-2 sm:p-4 my-auto max-w-full">
        <div className="bg-slate-900/90 rounded-[2.4rem] p-2 sm:p-2.5 shadow-2xl border border-slate-700 max-w-full">
          <div className="bg-slate-950 rounded-[1.9rem] p-1.5 sm:p-2 max-w-full">
            <div className="relative bg-black rounded-[1.5rem] overflow-hidden max-w-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-28 h-6 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-800 ring-1 ring-slate-700" />
                <span className="w-10 h-1.5 rounded-full bg-slate-800" />
              </div>

              <div className="relative z-10 h-8 flex items-center justify-between px-6 pt-1 text-white text-[10px] font-semibold">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-2.5 border border-white/90 rounded-[2px] flex items-end p-[1.5px]">
                    <span className="w-full h-2 bg-white/90 rounded-[1px]" />
                  </span>
                  <svg width="14" height="10" viewBox="0 0 14 10" className="fill-white/90">
                    <path d="M1 7 L4 3 L7 6 L10 1 L13 5" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div
                ref={scrollRef as React.RefObject<HTMLDivElement>}
                className="w-[768px] max-w-[calc(100vw-2.5rem)] h-[min(850px,calc(100vh-170px))] min-h-[380px] sm:min-h-[500px] overflow-y-auto overflow-x-hidden flex flex-col"
              >
                {children}
              </div>

              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-white/80 z-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile: authentic Android phone ────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 my-auto max-w-full">
      <div className="relative bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 rounded-[2.6rem] sm:rounded-[2.8rem] p-[8px] sm:p-[10px] shadow-2xl border border-slate-700/80 max-w-full">
        {/* Hardware side buttons */}
        <div className="absolute -left-[3px] top-20 sm:top-24 w-[3px] h-10 sm:h-12 rounded-l bg-slate-700" />
        <div className="absolute -left-[3px] top-34 sm:top-40 w-[3px] h-12 sm:h-16 rounded-l bg-slate-700" />
        <div className="absolute -right-[3px] top-24 sm:top-28 w-[3px] h-16 sm:h-20 rounded-r bg-slate-700" />

        <div className="bg-black rounded-[2rem] sm:rounded-[2.2rem] overflow-hidden relative max-w-full flex flex-col shadow-inner">
          {/* Centered Android Punch-Hole Camera */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-3 h-3 rounded-full bg-slate-950 ring-2 ring-slate-800 shadow-inner" />

          {/* Android Status Bar */}
          <div className="relative z-20 h-7 flex items-center justify-between px-5 pt-1 text-white select-none shrink-0">
            <span className="text-[11px] font-semibold tracking-wide">9:41</span>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="10" viewBox="0 0 15 11" className="fill-white">
                <rect x="0" y="7" width="2.5" height="4" rx="0.5" />
                <rect x="4" y="5" width="2.5" height="6" rx="0.5" />
                <rect x="8" y="2.5" width="2.5" height="8.5" rx="0.5" />
                <rect x="12" y="0" width="2.5" height="11" rx="0.5" />
              </svg>
              <svg width="14" height="10" viewBox="0 0 15 11" className="fill-white">
                <path d="M7.5 9.5 L9.5 7.5 C8.9 6.9 8.2 6.6 7.5 6.6 C6.8 6.6 6.1 6.9 5.5 7.5 Z" />
                <ellipse cx="7.5" cy="4.6" rx="5" ry="3.2" />
                <ellipse cx="7.5" cy="7.6" rx="2.2" ry="1.4" />
              </svg>
              <div className="flex items-center gap-[2px]">
                <div className="w-4 sm:w-5 h-2.5 border border-white/80 rounded-[3px] flex items-center p-[1.5px]">
                  <div className="w-2.5 sm:w-3.5 h-full bg-white rounded-[1px]" />
                </div>
                <div className="w-[2px] h-1.5 bg-white/80 rounded-r-sm" />
              </div>
            </div>
          </div>

          {/* Scrollable Screen Content */}
          <div
            ref={scrollRef as React.RefObject<HTMLDivElement>}
            className="w-[390px] sm:w-[412px] max-w-[calc(100vw-2.5rem)] h-[min(820px,calc(100vh-160px))] min-h-[380px] sm:min-h-[520px] overflow-y-auto overflow-x-hidden flex flex-col bg-slate-950"
          >
            {children}
          </div>

          {/* Android Gesture Navigation Bar */}
          <div className="relative z-20 h-6 flex items-center justify-center pb-1 bg-black select-none shrink-0">
            <div className="w-28 h-1 rounded-full bg-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
