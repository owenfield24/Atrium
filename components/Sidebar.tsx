"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "@/lib/utils";
import { hasAgency, isAgent, isLandlord, loadProfile, saveProfile, useProfile } from "@/lib/profile";
import { clearSession } from "@/lib/session";

type IconName =
  | "grid" | "brief" | "home" | "users" | "briefcase"
  | "building" | "megaphone" | "chart" | "user" | "plug"
  | "shield" | "card" | "cog" | "logout";

type Item = { href: string; label: string; icon: IconName };

/** Lucide-style icons rendered as inline SVG. Stroke-based, 24×24, 1.6 width. */
function Icon({ name }: { name: IconName }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.2" />
          <rect x="14" y="3" width="7" height="7" rx="1.2" />
          <rect x="3" y="14" width="7" height="7" rx="1.2" />
          <rect x="14" y="14" width="7" height="7" rx="1.2" />
        </svg>
      );
    case "brief":
      return (
        <svg {...common}>
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M16 4v3h3" />
          <path d="M8 11h8M8 15h8M8 19h5" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H10v7H4a1 1 0 0 1-1-1v-9z" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 13h18" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M5 22V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v18" />
          <path d="M3 22h18" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
          <path d="M10 22v-4h4v4" />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M3 11l16-6v14L3 13z" />
          <path d="M11 17v3a2 2 0 0 1-4 0v-2" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 3 3 5-6" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "plug":
      return (
        <svg {...common}>
          <path d="M9 3v6M15 3v6" />
          <path d="M5 9h14l-1 7a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z" />
          <path d="M12 19v3" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 11h18" />
          <path d="M7 16h3" />
        </svg>
      );
    case "cog":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 14a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
  }
}

/** Build the sidebar item list for a given user. We compose from boolean
 *  capabilities (agent / landlord / agency) instead of a fixed role enum so
 *  "Both" users see everything they need without us hand-listing every
 *  combination. */
function buildItems(opts: { agent: boolean; landlord: boolean; agency: boolean }): Item[] {
  const items: Item[] = [
    { href: "/dashboard", label: "Home", icon: "grid"  },
    { href: "/brief",     label: opts.landlord && !opts.agent ? "Rental brief" : "The Brief", icon: "brief" },
  ];
  if (opts.agent) {
    items.push(
      { href: "/listings",     label: "Listings", icon: "home"      },
      { href: "/transactions", label: "Deals",    icon: "briefcase" },
    );
  }
  // Always show Clients/Tenants — relabel for landlord-only
  items.push({
    href: "/clients",
    label: opts.landlord && !opts.agent ? "Tenants" : "Clients",
    icon: "users",
  });
  if (opts.landlord) {
    items.push({ href: "/keystone", label: "Properties", icon: "building" });
  }
  items.push(
    { href: "/marketing", label: "Marketing", icon: "megaphone" },
    { href: "/insights",  label: "Insights",  icon: "chart"     },
  );
  if (opts.agency) {
    items.push({ href: "/team", label: "Team", icon: "user" });
  }
  items.push(
    { href: "/integrations", label: "Integrations", icon: "plug"   },
    { href: "/compliance",   label: "Compliance",   icon: "shield" },
    { href: "/billing",      label: "Billing",      icon: "card"   },
    { href: "/settings",     label: "Settings",     icon: "cog"    },
  );
  return items;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useProfile();
  const items = buildItems({
    agent:    isAgent(profile?.role),
    landlord: isLandlord(profile?.role),
    agency:   hasAgency(profile?.role),
  });

  const onSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear the active session + flip emailVerified off on the saved profile
    // so the next visit forces a real sign-in. Profile data, clients, photos
    // remain on disk so re-signing in picks up exactly where they left off.
    clearSession();
    const existing = loadProfile();
    if (existing) saveProfile({ ...existing, emailVerified: false });
    router.push("/signin");
  };

  return (
    <aside
      className="hidden md:flex group fixed left-4 top-1/2 -translate-y-1/2 z-30 flex-col glass border border-line/60 rounded-3xl py-3 px-2 shadow-xl shadow-black/5 overflow-hidden transition-[width] duration-300 ease-out w-14 hover:w-52"
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={clsx(
              "flex items-center h-10 my-0.5 rounded-full pl-2 pr-3 flex-shrink-0 transition-colors",
              active ? "bg-ink text-white" : "text-mute hover:bg-line/60 hover:text-ink"
            )}
          >
            <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <Icon name={item.icon} />
            </span>
            <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
              {item.label}
            </span>
          </Link>
        );
      })}

      <div className="my-2 mx-3 border-t border-line/80" />

      <a
        href="/"
        onClick={onSignOut}
        title="Sign out"
        className="flex items-center h-10 my-0.5 rounded-full pl-2 pr-3 flex-shrink-0 transition-colors text-mute hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
      >
        <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <Icon name="logout" />
        </span>
        <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
          Sign out
        </span>
      </a>
    </aside>
  );
}
