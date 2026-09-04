import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Templates Gallery — OkInSite",
  description:
    "Explore handcrafted, mobile-ready digital presence templates for local businesses, creators, restaurants, portfolios, and personal brands. Preview live and launch in 3 minutes.",
  alternates: { canonical: "/templates" },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
