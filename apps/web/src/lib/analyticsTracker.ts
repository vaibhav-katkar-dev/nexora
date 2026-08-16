import { analyticsApi } from "./api";

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w <= 640) return "mobile";
  if (w <= 1024) return "tablet";
  return "desktop";
}

/**
 * Initializes privacy-friendly, zero-overhead analytics tracking on a published site.
 * Tracks pageview, time on page (duration), and interactive button/link clicks.
 * Returns cleanup function.
 */
export function initSiteAnalytics(siteSlugOrId: string): () => void {
  if (typeof window === "undefined" || !siteSlugOrId) return () => {};

  // Skip tracking if in iframe editor or preview
  if (window.location.pathname.startsWith("/editor") || window.location.pathname.startsWith("/preview")) {
    return () => {};
  }

  const startTime = Date.now();
  const deviceType = getDeviceType();
  const referrer = document.referrer || "";

  // 1. Initial Pageview
  analyticsApi.collect({
    siteIdOrSlug: siteSlugOrId,
    eventType: "pageview",
    referrer,
    deviceType,
  });

  // 2. Click tracking for CTAs and outbound links
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const clickable = target.closest("a, button, [role='button']");
    if (!clickable) return;

    const label =
      clickable.getAttribute("data-analytics-label") ||
      clickable.getAttribute("aria-label") ||
      clickable.textContent?.trim().slice(0, 40) ||
      (clickable as HTMLAnchorElement).href ||
      "Interactive Element";

    analyticsApi.collect({
      siteIdOrSlug: siteSlugOrId,
      eventType: "click",
      target: label,
      deviceType,
    });
  };

  document.addEventListener("click", handleClick, { passive: true });

  // 3. Duration tracking on unload or visibility hide
  let durationReported = false;
  const sendDuration = () => {
    if (durationReported) return;
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    if (durationSeconds >= 2) {
      durationReported = true;
      analyticsApi.collect({
        siteIdOrSlug: siteSlugOrId,
        eventType: "duration",
        durationSeconds,
        deviceType,
      });
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      sendDuration();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", sendDuration);
  window.addEventListener("beforeunload", sendDuration);

  return () => {
    document.removeEventListener("click", handleClick);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", sendDuration);
    window.removeEventListener("beforeunload", sendDuration);
    sendDuration();
  };
}
