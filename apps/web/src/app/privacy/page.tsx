import type { Metadata } from "next";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — OkInSite",
  description: "Read OkInSite's Privacy Policy. Understand how we handle your data, protect user privacy, and manage digital presences.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-10">
        <div className="border-b border-slate-200 pb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Last Updated: September 2026 · OkInSite (okinsite.com)
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Overview & Commitment</h2>
            <p>
              At OkInSite ("we", "our", or "platform"), accessible from okinsite.com, we respect your privacy and are committed to protecting the personal data of our users and their website visitors. This Privacy Policy explains what information we collect, how it is used, and how your privacy is protected when you create or visit sites on OkInSite.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Information We Collect</h2>
            <p>We collect information in the following contexts:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Account Credentials:</strong> When you register an account, we collect your email address and authentication details.</li>
              <li><strong>Project Configurations:</strong> Content, text, links, business names, photos, and configurations you explicitly submit to build your public digital presence.</li>
              <li><strong>Form Submissions:</strong> Inquiries submitted by visitors through your site's contact forms are forwarded directly to your configured email or WhatsApp number and stored securely for your review in the studio dashboard.</li>
              <li><strong>Aggregated Anonymous Analytics:</strong> We record lightweight, privacy-friendly pageviews, referral channels, and device types to provide you with basic visitor metrics. We do not sell or monetize personal browsing history.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. How Information Is Used</h2>
            <p>We use collected information solely to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Host, serve, and cache your published digital presence on global edge networks.</li>
              <li>Deliver instant lead notifications to your designated email or WhatsApp endpoints.</li>
              <li>Provide you with aggregate traffic statistics in your dashboard.</li>
              <li>Maintain platform security, prevent abuse, and uphold our service integrity.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Third-Party Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal data to marketing brokers or advertising networks. Content published on public subdomains (e.g. yourname.okinsite.com) is public by nature and indexable by search engine crawlers as intended by the user.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">5. Contact & Data Rights</h2>
            <p>
              You have the right to edit, export, or delete your projects and account data at any time from your OkInSite dashboard. For privacy-related inquiries, please reach out to our team at support@okinsite.com.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
