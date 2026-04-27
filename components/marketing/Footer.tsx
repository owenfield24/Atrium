import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="mt-32 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 text-sm text-mute">
        <p>© 2026 Atrium Realty Co., Inc. — Fort Worth, Texas</p>
        <div className="flex flex-wrap gap-5">
          <Link href="/features" className="hover:text-ink">Features</Link>
          <Link href="/pricing"  className="hover:text-ink">Pricing</Link>
          <Link href="/about"    className="hover:text-ink">About</Link>
          <Link href="/dashboard"className="hover:text-ink">Dashboard</Link>
          <Link href="#"          className="hover:text-ink">Privacy</Link>
          <Link href="#"          className="hover:text-ink">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
