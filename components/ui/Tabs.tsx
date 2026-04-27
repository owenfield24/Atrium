"use client";

import { useState, ReactNode } from "react";
import { clsx } from "@/lib/utils";

type Tab = { id: string; label: string; count?: number };

export function Tabs({
  tabs,
  initial,
  children,
}: {
  tabs: Tab[];
  initial?: string;
  children: (active: string) => ReactNode;
}) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  return (
    <div>
      <div className="flex items-center gap-1 border-b border-slate-200 mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={clsx(
              "relative px-3.5 py-2.5 text-sm font-medium transition-colors -mb-px",
              active === t.id
                ? "text-slate-900 border-b-2 border-amber-500"
                : "text-slate-500 hover:text-slate-800 border-b-2 border-transparent"
            )}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={clsx(
                  "ml-1.5 inline-flex items-center justify-center text-xs font-semibold rounded-full px-1.5 min-w-[1.25rem]",
                  active === t.id
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div>{children(active)}</div>
    </div>
  );
}
