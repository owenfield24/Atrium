import { ReactNode } from "react";
import { clsx } from "@/lib/utils";

export function Card({
  children,
  className,
  padding = "p-5",
}: {
  children: ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div className={clsx("bg-white rounded-xl border border-slate-200", padding, className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  delta,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  delta?: { value: string; positive?: boolean };
  highlight?: boolean;
}) {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl border px-5 py-4",
        highlight ? "border-amber-300 bg-amber-50" : "border-slate-200"
      )}
    >
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p
          className={clsx(
            "text-2xl font-bold",
            highlight ? "text-amber-600" : "text-slate-900"
          )}
        >
          {value}
        </p>
        {delta && (
          <span
            className={clsx(
              "text-xs font-semibold",
              delta.positive ? "text-emerald-600" : "text-red-500"
            )}
          >
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
