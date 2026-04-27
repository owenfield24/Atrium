"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Shared input chrome — visible-but-subtle by default so users can see
// every field is editable, deepens on hover/focus.
const SHARED =
  "w-full bg-white/60 text-sm text-ink rounded-md px-3 py-2 " +
  "border border-line/70 hover:border-line hover:bg-white " +
  "focus:border-ink focus:bg-white focus:outline-none transition-colors " +
  "placeholder:text-mute/50";

/** Section wrapper: monospace eyebrow + title, divider above. */
export function Section({ eyebrow, title, action, children }: {
  eyebrow: string;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-line pt-5 mt-5 first:border-t-0 first:mt-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">{eyebrow}</p>
          {title && <p className="mt-1 text-sm font-semibold text-ink tighter">{title}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

/** A two-column row: label on left, editable control on right. */
export function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-3 py-1">
      <div className="pt-2">
        <p className="text-[11px] text-mute font-medium">{label}</p>
        {hint && <p className="text-[10px] text-mute/70 mt-0.5">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Text input. Commits on every keystroke so consumers update instantly. */
export function TextField({
  value, onCommit, placeholder, type = "text", multiline,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url";
  multiline?: boolean;
}) {
  const [local, setLocal]   = useState(value);
  const [focused, setFocus] = useState(false);

  // Pull external updates in only when the user isn't actively editing,
  // so the caret never jumps mid-type.
  useEffect(() => { if (!focused) setLocal(value); }, [value, focused]);

  const change = (next: string) => { setLocal(next); onCommit(next); };

  if (multiline) {
    return (
      <textarea
        value={local}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e) => change(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className={`${SHARED} resize-y min-h-[40px] leading-relaxed`}
      />
    );
  }
  return (
    <input
      type={type}
      value={local}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onChange={(e) => change(e.target.value)}
      placeholder={placeholder}
      className={SHARED}
    />
  );
}

/** Numeric input with optional currency formatting. Accepts digits, dots,
 *  and commas. Reformats with thousand separators on blur. Commits the
 *  parsed number on every keystroke so dependent UI (budget tile, top-5
 *  matches) updates live. */
export function NumberField({
  value, onCommit, placeholder, currency,
}: {
  value: number | null | undefined;
  onCommit: (v: number | null) => void;
  placeholder?: string;
  currency?: boolean;
}) {
  const formatted = (n: number | null | undefined) =>
    n == null ? "" : n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  const [local, setLocal]   = useState<string>(formatted(value));
  const [focused, setFocus] = useState(false);

  useEffect(() => { if (!focused) setLocal(formatted(value)); }, [value, focused]);

  const change = (raw: string) => {
    // Accept digits, dots, commas. Strip commas before parsing.
    const sanitized = raw.replace(/[^0-9.,]/g, "");
    setLocal(sanitized);
    const num = parseFloat(sanitized.replace(/,/g, ""));
    onCommit(isNaN(num) ? null : num);
  };

  const onBlur = () => {
    setFocus(false);
    const num = parseFloat(local.replace(/,/g, ""));
    if (!isNaN(num)) setLocal(num.toLocaleString("en-US", { maximumFractionDigits: 4 }));
    else if (local === "") setLocal("");
  };

  return (
    <div className="relative">
      {currency && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mute font-mono text-sm pointer-events-none">$</span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={local}
        onFocus={() => setFocus(true)}
        onBlur={onBlur}
        onChange={(e) => change(e.target.value)}
        placeholder={placeholder}
        className={`${SHARED} font-mono ${currency ? "pl-7" : ""}`}
      />
    </div>
  );
}

/** Date input. */
export function DateField({
  value, onCommit,
}: { value: string | undefined; onCommit: (v: string) => void; }) {
  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(e) => onCommit(e.target.value)}
      className={`${SHARED} font-mono`}
    />
  );
}

/** Select / dropdown. */
export function SelectField<T extends string>({
  value, onCommit, options, placeholder,
}: {
  value: T | undefined;
  onCommit: (v: T | undefined) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onCommit((e.target.value || undefined) as T | undefined)}
      className={`${SHARED} appearance-none cursor-pointer`}
    >
      <option value="">{placeholder ?? "—"}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/** Boolean switch styled as a refined pill toggle. */
export function ToggleField({
  value, onCommit,
}: { value: boolean; onCommit: (v: boolean) => void; }) {
  return (
    <button
      type="button"
      onClick={() => onCommit(!value)}
      role="switch"
      aria-checked={value}
      className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors ${
        value ? "bg-ink" : "bg-line"
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 bg-white rounded-full shadow-sm transition-transform ${
        value ? "translate-x-5" : "translate-x-1"
      }`} />
    </button>
  );
}

/** Editable list of chips — type to add, click × to remove. */
export function ChipsField({
  value, onCommit, placeholder,
}: {
  value: string[] | undefined;
  onCommit: (v: string[]) => void;
  placeholder?: string;
}) {
  const list = value ?? [];
  const [draft, setDraft] = useState("");

  const commit = (next: string[]) => onCommit(next);

  const addDraft = () => {
    const t = draft.trim();
    if (!t) return;
    if (list.includes(t)) { setDraft(""); return; }
    commit([...list, t]);
    setDraft("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-md border border-line/70 bg-white/60 hover:border-line hover:bg-white focus-within:border-ink focus-within:bg-white transition-colors min-h-[40px]">
      {list.map((chip) => (
        <span key={chip} className="inline-flex items-center gap-1 bg-soft text-ink text-xs font-medium px-2 py-0.5 rounded-full border border-line/60">
          {chip}
          <button
            type="button"
            onClick={() => commit(list.filter((c) => c !== chip))}
            className="text-mute hover:text-rose-600 leading-none text-sm"
            aria-label={`Remove ${chip}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addDraft(); }
          else if (e.key === "Backspace" && draft === "" && list.length > 0) {
            commit(list.slice(0, -1));
          }
        }}
        onBlur={addDraft}
        placeholder={list.length === 0 ? (placeholder ?? "Type and press Enter") : ""}
        className="flex-1 min-w-[100px] bg-transparent text-sm text-ink focus:outline-none placeholder:text-mute/50"
      />
    </div>
  );
}
