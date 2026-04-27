import { ReactNode } from "react";
import { clsx } from "@/lib/utils";

type Tone =
  | "slate"
  | "emerald"
  | "amber"
  | "blue"
  | "violet"
  | "red"
  | "teal"
  | "purple";

const tones: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
};

export function Badge({
  children,
  tone = "slate",
  ring = true,
}: {
  children: ReactNode;
  tone?: Tone;
  ring?: boolean;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center text-xs px-1.5 py-0.5 rounded font-medium",
        tones[tone],
        ring && "ring-1 ring-inset"
      )}
    >
      {children}
    </span>
  );
}
