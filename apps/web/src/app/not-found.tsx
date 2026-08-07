import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center p-8 space-y-6" style={{ borderRadius: "24px" }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-3xl font-black" style={{ background: "var(--brand-subtle)", color: "var(--brand)" }}>
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>This page could not be found</h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            The page or digital presence card you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link href="/dashboard" className="btn btn-primary btn-lg gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Workspace
          </Link>
          <Link href="/" className="btn btn-secondary text-sm gap-2">
            <Search className="w-4 h-4" /> Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
