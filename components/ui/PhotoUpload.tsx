"use client";

import { useRef, useState } from "react";
import PhotoCropper from "./PhotoCropper";

interface Props {
  /** Current photo as data URL (or undefined). */
  value?: string;
  /** Two-letter fallback initials shown when no photo is set. */
  initials: string;
  /** Called with the cropped data URL after the user saves. Pass empty string to clear. */
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
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const onPick = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload  = () => setRawImage(String(reader.result));
    reader.onerror = () => setError("Could not read this image.");
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className={`${SIZES[size]} relative rounded-full overflow-hidden flex items-center justify-center font-bold flex-shrink-0 bg-ink text-amber-400 ring-1 ring-line/60`}>
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium text-ink bg-soft border border-line/80 hover:border-ink/40 px-3 py-1.5 rounded-full"
          >
            {value ? "Replace" : "Upload photo"}
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

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.currentTarget.value = ""; }}
          className="hidden"
        />
      </div>

      {error && <p className="mt-2 text-[11px] text-rose-600">{error}</p>}

      {rawImage && (
        <PhotoCropper
          image={rawImage}
          onCancel={() => setRawImage(null)}
          onSave={(cropped) => {
            onChange(cropped);
            setRawImage(null);
          }}
        />
      )}
    </>
  );
}
