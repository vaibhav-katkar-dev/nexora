import Image from "next/image";

const LOGO_URL = "https://res.cloudinary.com/usj348ny/image/upload/v1788452134/okinsite.png";

interface OkinsiteLogoProps {
  /** px size of the logo image (square). Default 32 */
  size?: number;
  /** Whether to show the "OkInSite" wordmark text next to the logo */
  showWordmark?: boolean;
  /** Extra class for the wordmark text */
  wordmarkClass?: string;
  /** Wrapper className */
  className?: string;
  /** Set to true when used on a dark/coloured background — wordmark turns white */
  dark?: boolean;
}

/**
 * OkInSite brand logo — single source of truth.
 * Replace the LOGO_URL constant if the logo ever changes.
 */
export function OkinsiteLogo({
  size = 32,
  showWordmark = true,
  wordmarkClass,
  className = "",
  dark = false,
}: OkinsiteLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src={LOGO_URL}
        alt="OkInSite logo"
        width={size}
        height={size}
        className="rounded-lg object-contain shrink-0"
        priority
        unoptimized
      />
      {showWordmark && (
        <span
          className={wordmarkClass ?? `font-bold tracking-tight text-sm ${dark ? "text-white" : "text-slate-900"}`}
        >
          OkInSite
        </span>
      )}
    </span>
  );
}
