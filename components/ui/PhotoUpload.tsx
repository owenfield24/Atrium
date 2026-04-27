"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image";

interface Props {
  /** Current photo as data URL (or undefined). */
  value?: string;
  /** Two-letter fallback initials shown when no photo is set. */
  initials: string;
  /** Called with the compressed data URL after upload. Pass empty string to clear. */
  onChange: (dataUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "w-16 h-16 text-base",
  md: "w-24 h-24 text-2xl",
  lg: "w-32 h-32 text-3xl",
};

export default function PhotoUpload({ value, initials, onChange, size = "md" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={`${SIZES[size]} relative rounded-full overflow-hidden flex items-center justify-center font-bold flex-shrink-0 bg-ink text-amber-400 ring-1 ring-line/60`}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
        {busy && (
          <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-mono">…</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium text-ink bg-soft border border-line/80 hover:border-ink/40 px-3 py-1.5 rounded-full"
          >
            {value ? "Replace photo" : "Upload photo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-medium text-mute hover:text-rose-600 px-3 py-1.5 rounded-full"
            >
              Remove
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-mute leading-snug">
          PNG, JPG, or HEIC. We center-crop to a square and resize before saving — keep it under 5 MB.
        </p>
        {error && <p className="mt-1.5 text-[11px] text-rose-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.currentTarget.value = ""; }}
        className="hidden"
      />
    </div>
  );
}
