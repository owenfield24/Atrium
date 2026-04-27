"use client";

import { useEffect, useRef, useState } from "react";

const VIEW_MAX = 480;
const OUTPUT   = 256;
const MIN_SIZE = 64;

type Mode = "move" | "tl" | "tr" | "bl" | "br";

interface Props {
  image: string;
  onSave: (cropped: string) => void;
  onCancel: () => void;
}

/**
 * Classic crop UI: draggable square overlay on top of the image. Drag the
 * square body to reposition; drag any corner handle to resize. The output
 * is always a 1:1 crop scaled to 256x256 JPEG.
 */
export default function PhotoCropper({ image, onSave, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [crop, setCrop]       = useState({ x: 0, y: 0, size: 0 });
  const dragRef               = useRef<{ mode: Mode; startX: number; startY: number; base: { x: number; y: number; size: number } } | null>(null);

  // Cancel on Esc
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onCancel]);

  const scale =
    natural.w && natural.h
      ? Math.min(VIEW_MAX / natural.w, VIEW_MAX / natural.h, 1)
      : 1;
  const displayW = Math.round(natural.w * scale);
  const displayH = Math.round(natural.h * scale);

  // Initialize the crop window on image load (centered, 80% of the smaller side)
  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const t = e.currentTarget;
    const s = Math.min(VIEW_MAX / t.naturalWidth, VIEW_MAX / t.naturalHeight, 1);
    const dW = t.naturalWidth  * s;
    const dH = t.naturalHeight * s;
    const initial = Math.min(dW, dH) * 0.85;
    setNatural({ w: t.naturalWidth, h: t.naturalHeight });
    setCrop({
      x: (dW - initial) / 2,
      y: (dH - initial) / 2,
      size: initial,
    });
  };

  const beginDrag = (mode: Mode, clientX: number, clientY: number, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    dragRef.current = { mode, startX: clientX, startY: clientY, base: { ...crop } };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      e.preventDefault();
      const point = "touches" in e ? e.touches[0] : (e as MouseEvent);
      const dx = point.clientX - dragRef.current.startX;
      const dy = point.clientY - dragRef.current.startY;
      const { mode, base } = dragRef.current;

      let { x, y, size } = base;

      if (mode === "move") {
        x = Math.max(0, Math.min(displayW - base.size, base.x + dx));
        y = Math.max(0, Math.min(displayH - base.size, base.y + dy));
      } else if (mode === "br") {
        // Top-left fixed; bottom-right moves.
        const target = Math.min(base.size + dx, base.size + dy); // square: take the smaller delta
        size = Math.max(MIN_SIZE, Math.min(target, displayW - base.x, displayH - base.y));
      } else if (mode === "tl") {
        // Bottom-right fixed; top-left moves.
        const target = Math.min(base.size - dx, base.size - dy);
        size = Math.max(MIN_SIZE, Math.min(target, base.x + base.size, base.y + base.size));
        x = base.x + base.size - size;
        y = base.y + base.size - size;
      } else if (mode === "tr") {
        // Bottom-left fixed; top-right moves.
        const target = Math.min(base.size + dx, base.size - dy);
        size = Math.max(MIN_SIZE, Math.min(target, displayW - base.x, base.y + base.size));
        y = base.y + base.size - size;
      } else if (mode === "bl") {
        // Top-right fixed; bottom-left moves.
        const target = Math.min(base.size - dx, base.size + dy);
        size = Math.max(MIN_SIZE, Math.min(target, base.x + base.size, displayH - base.y));
        x = base.x + base.size - size;
      }

      setCrop({ x, y, size });
    };
    const onUp = () => { dragRef.current = null; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend",  onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend",  onUp);
    };
  }, [displayW, displayH]);

  const save = () => {
    const img = imgRef.current;
    if (!img || !natural.w || !natural.h || !crop.size) return;
    const canvas = document.createElement("canvas");
    canvas.width  = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Convert crop coords (display space) → source rect on natural image
    const srcX    = crop.x    / scale;
    const srcY    = crop.y    / scale;
    const srcSize = crop.size / scale;
    ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT, OUTPUT);
    onSave(canvas.toDataURL("image/jpeg", 0.85));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-line shadow-2xl overflow-hidden w-full max-w-xl">
        <div className="px-6 pt-5 pb-3 border-b border-line flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">Crop photo</p>
            <p className="mt-1 text-base font-semibold tighter">Drag the square. Drag corners to resize.</p>
          </div>
          <button onClick={onCancel} className="text-mute hover:text-ink text-2xl leading-none w-9 h-9 rounded-full hover:bg-soft flex items-center justify-center">×</button>
        </div>

        <div className="p-6 flex justify-center bg-soft/40">
          <div
            className="relative select-none touch-none"
            style={{ width: displayW || "auto", height: displayH || "auto" }}
          >
            <img
              ref={imgRef}
              src={image}
              alt=""
              draggable={false}
              onLoad={onLoad}
              style={{ display: "block", width: displayW, height: displayH }}
            />
            {natural.w > 0 && (
              <div
                className="absolute cursor-move"
                style={{
                  left: crop.x, top: crop.y,
                  width: crop.size, height: crop.size,
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
                  border: "2px solid #FFFFFF",
                }}
                onMouseDown={(e) => beginDrag("move", e.clientX, e.clientY, e)}
                onTouchStart={(e) => beginDrag("move", e.touches[0].clientX, e.touches[0].clientY, e)}
              >
                {/* Rule-of-thirds guide lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
                </div>

                {/* Corner handles */}
                {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                  <div
                    key={corner}
                    onMouseDown={(e) => beginDrag(corner, e.clientX, e.clientY, e)}
                    onTouchStart={(e) => beginDrag(corner, e.touches[0].clientX, e.touches[0].clientY, e)}
                    className={`absolute w-3.5 h-3.5 bg-white border-2 border-ink ${
                      corner === "tl" ? "-top-1.5 -left-1.5  cursor-nwse-resize" :
                      corner === "tr" ? "-top-1.5 -right-1.5 cursor-nesw-resize" :
                      corner === "bl" ? "-bottom-1.5 -left-1.5  cursor-nesw-resize" :
                                        "-bottom-1.5 -right-1.5 cursor-nwse-resize"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-5 pt-3 flex items-center justify-end gap-3 border-t border-line">
          <button onClick={onCancel} className="text-sm font-medium text-mute hover:text-ink px-3 py-2 rounded-full">Cancel</button>
          <button onClick={save} className="bg-ink text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-mute">Save photo</button>
        </div>
      </div>
    </div>
  );
}
