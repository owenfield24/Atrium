import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-soft flex flex-col">
      {/* Floating "Back to site" — sits on the right pane only on desktop */}
      <Link
        href="/"
        className="fixed top-5 right-6 md:right-10 z-40 text-xs text-mute hover:text-ink font-medium px-3 py-1.5 rounded-full bg-white/70 border border-line/60 backdrop-blur"
      >
        ← Back to site
      </Link>
      <main className="flex-1 flex items-stretch">{children}</main>
    </div>
  );
}
