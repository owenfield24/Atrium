"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AtriumLogo from "@/components/AtriumLogo";
import { clsx } from "@/lib/utils";
import { useProfile } from "@/lib/profile";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing",  label: "Pricing"  },
  { href: "/about",    label: "About"    },
];

export default function MarketingNav() {
  const path = usePathname();
  const profile = useProfile();
  const signedIn = !!profile?.emailVerified;

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
      <div className="glass border border-line/60 rounded-full pl-3 pr-1 py-1 flex items-center gap-1 shadow-lg shadow-black/5">
        <Link href="/" className="px-2"><AtriumLogo /></Link>
        <span className="w-px h-5 bg-line mx-1" />
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={clsx(
              "px-3 py-1.5 text-sm rounded-full transition-colors",
              path === l.href ? "bg-ink text-white" : "text-mute hover:text-ink"
            )}
          >
            {l.label}
          </Link>
        ))}

        <Link
          href={signedIn ? "/dashboard" : "/signin"}
          className="ml-1 bg-ink text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-mute"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
