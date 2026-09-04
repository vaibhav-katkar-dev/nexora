import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="https://res.cloudinary.com/usj348ny/image/upload/v1788452134/okinsite.png"
                alt="OkInSite"
                className="h-8 w-auto object-contain brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your place on the internet. A simple, credible digital presence platform for creators, freelancers, local businesses, restaurants, and personal brands.
            </p>
            <div className="text-xs text-slate-500">
              Claim your clean web address: <span className="text-blue-400 font-mono">yourname.okinsite.com</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Product</div>
            <ul className="space-y-2">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors">Templates Gallery</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Solutions</div>
            <ul className="space-y-2">
              <li><Link href="/templates?category=business" className="hover:text-white transition-colors">Local Business</Link></li>
              <li><Link href="/templates?category=portfolio" className="hover:text-white transition-colors">Freelancers & Portfolios</Link></li>
              <li><Link href="/templates?category=restaurant" className="hover:text-white transition-colors">Restaurant QR Menus</Link></li>
              <li><Link href="/templates?category=link_in_bio" className="hover:text-white transition-colors">Link in Bio Hubs</Link></li>
              <li><Link href="/templates?category=personal" className="hover:text-white transition-colors">Personal Brands</Link></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Company & Legal</div>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">About OkInSite</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Help & FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} OkInSite. All rights reserved.</p>
          <p className="font-mono text-[11px]">okinsite.com · Claim your place on the internet.</p>
        </div>
      </div>
    </footer>
  );
}
