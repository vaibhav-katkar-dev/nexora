import { CustomTemplateSchemaGroup } from "../customTemplateRegistry";

export interface NoirPremiumData {
  profile: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
  };
  badge: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
  links: Array<{
    label: string;
    url: string;
    sub?: string;
    badge?: string;
    icon?: string;
    featured?: boolean;
  }>;
  gallery: Array<{
    url: string;
    alt?: string;
  }>;
  socials: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    email?: string;
  };
  footerText?: string;
}

export const defaultNoirPremiumData: NoirPremiumData = {
  profile: {
    name: "Noor Ali",
    role: "Photographer & Visual Storyteller",
    bio: "Capturing quiet, cinematic moments across the Middle East & beyond. Prints, presets and bookings below.",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  badge: "✨ Available for Collabs",
  stats: [
    { value: "318K", label: "Followers" },
    { value: "2.4M", label: "Monthly Views" },
    { value: "60+", label: "Countries Shot" },
  ],
  links: [
    {
      label: "Shop Fine Art Prints",
      url: "https://noorali.example.com/prints",
      sub: "Limited edition drops",
      badge: "NEW",
      icon: "✦",
      featured: true,
    },
    {
      label: "Instagram",
      url: "https://instagram.com",
      icon: "◎",
    },
    {
      label: "Behind the Shoot — YouTube",
      url: "https://youtube.com",
      icon: "▶",
    },
    {
      label: "Lightroom Presets",
      url: "https://noorali.example.com/presets",
      icon: "🎞",
    },
    {
      label: "Book a Session",
      url: "https://cal.com/noorali",
      icon: "📅",
    },
    {
      label: "Business Inquiries",
      url: "mailto:hello@noorali.example.com",
      icon: "✉",
    },
  ],
  gallery: [
    { url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&q=80", alt: "Desert dunes at golden hour" },
    { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80", alt: "City street at night" },
    { url: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=400&q=80", alt: "Mountain landscape" },
    { url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=80", alt: "Portrait in warm light" },
  ],
  socials: {
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
  },
  footerText: "© 2026 Noor Ali · Booking: hello@noorali.example.com",
};

export const noirPremiumSchema: CustomTemplateSchemaGroup[] = [
  {
    groupName: "Profile & Hero",
    description: "Personal identity, glowing avatar, name, and headline",
    fields: [
      { key: "profile.avatar", label: "Profile Photo / Avatar", type: "image" },
      { key: "profile.name", label: "Full Name", type: "text", placeholder: "e.g. Noor Ali" },
      { key: "profile.role", label: "Role / Tagline", type: "text", placeholder: "e.g. Photographer & Visual Storyteller" },
      { key: "profile.bio", label: "Bio / About", type: "textarea", placeholder: "Short description about what you create..." },
      { key: "badge", label: "Status Badge", type: "text", placeholder: "e.g. ✨ Available for Collabs" },
    ],
  },
  {
    groupName: "Key Statistics",
    description: "Highlight followers, reach, or key achievements",
    fields: [
      { key: "stats", label: "Audience & Reach Stats", type: "stats-array" },
    ],
  },
  {
    groupName: "Curated Links",
    description: "Action buttons, store links, presets, and bookings with WhatsApp support",
    fields: [
      { key: "links", label: "Link Buttons", type: "links-array" },
    ],
  },
  {
    groupName: "Mini Photo Gallery",
    description: "Visual portfolio frames with 1-click image upload/replacement",
    fields: [
      { key: "gallery", label: "Gallery Photos", type: "gallery-array" },
    ],
  },
  {
    groupName: "Social Handles & Footer",
    description: "Social media links and copyright notice",
    fields: [
      { key: "socials", label: "Social Media Links", type: "socials-object" },
      { key: "footerText", label: "Footer Text", type: "text", placeholder: "© 2026 Your Name · All rights reserved" },
    ],
  },
];
