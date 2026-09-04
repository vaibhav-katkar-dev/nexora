import type { Metadata } from "next";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";

export const metadata: Metadata = {
  title: "Terms of Service — OkInSite",
  description: "Terms of Service governing the use of OkInSite (okinsite.com), subdomain allocation, and digital presence publishing.",
  alternates: { canonical: "/terms" },
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-10">
        <div className="border-b border-slate-200 pb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Effective: September 2026 · OkInSite (okinsite.com)
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the OkInSite platform, website, or editor (collectively, the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Subdomain Reservation & Ownership</h2>
            <p>
              OkInSite provides users with the ability to claim and publish websites on dedicated subdomains (such as <code>yourname.okinsite.com</code>). Subdomain handles are allocated on a first-come, first-served basis. OkInSite reserves the right to reclaim, suspend, or reassign subdomains that violate trademark rights, impersonate public figures or existing businesses, engage in domain squatting, or violate our Acceptable Use Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. Acceptable Use Policy</h2>
            <p>You agree not to use the Service to publish, distribute, or link to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Phishing sites, malware distribution, or fraudulent credential collection schemes.</li>
              <li>Illegal goods, services, or activities prohibited by local or international law.</li>
              <li>Harassing, defamatory, abusive, or copyright-infringing material.</li>
              <li>Spam, automated high-volume bot content, or deceptive redirects.</li>
            </ul>
            <p className="text-xs text-slate-500">
              Violating sites are subject to immediate termination, blocking from sitemap indexes, and account suspension without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Intellectual Property & Your Content</h2>
            <p>
              You retain all ownership rights to the content, text, images, and logos you upload to your OkInSite digital presence. By publishing on OkInSite, you grant us a worldwide, non-exclusive license solely to host, cache, compile, display, and distribute your content across our global edge networks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">5. Service Availability & Disclaimer</h2>
            <p>
              OkInSite strives for 99.9% platform uptime across our edge CDN networks. The Service is provided on an "as-is" and "as-available" basis. OkInSite is not liable for indirect, incidental, or consequential damages resulting from platform downtime or data loss.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
