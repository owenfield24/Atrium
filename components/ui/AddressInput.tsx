"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchAddresses, type AddressSuggestion } from "@/lib/addresses";

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Called when a suggestion is picked, receives the full structured address. */
  onPick?: (s: AddressSuggestion) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export default function AddressInput({ value, onChange, onPick, placeholder, autoFocus, className }: Props) {
  const [open, setOpen]             = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => searchAddresses(value), [value]);

  useEffect(() => {
    setHighlighted(0);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (s: AddressSuggestion) => {
    onChange(s.full);
    onPick?.(s);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder ?? "Start typing an address…"}
        onFocus={() => setOpen(true)}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(suggestions.length - 1, h + 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(0, h - 1)); }
          else if (e.key === "Enter")  { e.preventDefault(); pick(suggestions[highlighted]); }
          else if (e.key === "Escape") { setOpen(false); }
        }}
        className="w-full px-4 py-3 rounded-lg border border-line bg-white text-sm text-ink focus:border-ink focus:outline-none placeholder:text-mute/50 transition-colors"
      />
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-line bg-white shadow-2xl shadow-black/10 py-1.5"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.full}
              role="option"
              aria-selected={i === highlighted}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              className={`px-4 py-2.5 cursor-pointer flex items-start gap-3 transition-colors ${
                i === highlighted ? "bg-soft" : ""
              }`}
            >
              <span className="mt-0.5 flex-shrink-0 text-mute">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-ink truncate">{s.street}</span>
                <span className="block text-[11px] text-mute font-mono">{s.city} · {s.state} {s.zip}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
