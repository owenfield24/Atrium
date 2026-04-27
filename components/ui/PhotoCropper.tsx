"use client";

import { useEffect, useRef, useState } from "react";

const VIEWPORT = 320;
const OUTPUT   = 256;

interface Props {
  image: string;                    // raw data URL of the picked file
  onSave: (cropped: string) => void;
  onCancel: () => void;
}

/**
 * Manual circle-crop UI. The image fills a square viewport and the user can
 * pan it with mouse/touch + zoom with the slider. Pan is constrained so the
 * image always covers the viewport (no empty edges in the output).
 */
export default function PhotoCropper({ image, onSave, onCancel }: Props) {
  const imgRef                        = useRef<HTMLImageElement>(null);
  const [zoom, setZoom]               = useState(1);
  const [pos, setPos]                 = useState({ x: 0, y: 0 });
  const [natural, setNatural]         = useState({ w: 0, h: 0 });
  const dragRef                       = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [, force]                     = useState(0);

  // Esc to cancel
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onCancel]);

  const baseScale = natural.w && natural.h ? Math.max(VIEWPORT / natural.w, VIEWPORT / natural.h) : 1;
  const totalScale = baseScale * zoom;
  const renderedW = natural.w * totalScale;
  const renderedH = natural.h * totalScale;

  // Constrain pan so the image always covers the viewport
  const maxX = Math.max(0, (renderedW - VIEWPORT) / 2);
  const maxY = Math.max(0, (renderedH - VIEWPORT) / 2);
  const cx = Math.max(-maxX, Math.min(maxX, pos.x));
  const cy = Math.max(-maxY, Math.min(maxY, pos.y));

  const beginDrag = (clientX: number, clientY: number) => {
    dragRef.current = { startX: clientX, startY: clientY, baseX: cx, baseY: cy };
  };

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const point = "touches" in e ? e.touches[0] : (e as MouseEvent);
      const next = {
        x: dragRef.current.baseX + (point.clientX - dragRef.current.startX),
        y: dragRef.current.baseY + (point.clientY - dragRef.current.startY),
      };
      setPos(next);
    };
    const up = () => { dragRef.current = null; };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup",   up);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend",  up);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup",   up);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend",  up);
    };
  }, []);

  // Whenever zoom changes, re-clamp pan
  useEffect(() => { force((v) => v + 1); /* trigger constraint re-render */ }, [zoom]);

  const save = () => {
    const img = imgRef.current;
    if (!img || !natural.w || !natural.h) return;
    const canvas = document.createElement("canvas");
    canvas.width  = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Source rect on the natural image that maps to the viewport
    const sourceSize = VIEWPORT / totalScale;
    const ncx = natural.w / 2 - cx / totalScale;   // image-space center x
    const ncy = natural.h / 2 - cy / totalScale;   // image-space center y
    const sx  = ncx - sourceSize / 2;
    const sy  = ncy - sourceSize / 2;

    ctx.drawImage(img, sx, sy, sourceSize, sourceSize, 0, 0, OUTPUT, OUTPUT);
    onSave(canvas.toDataURL("image/jpeg", 0.85));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-line shadow-2xl overflow-hidden w-full max-w-md">
        <div className="px-6 pt-5 pb-3 border-b border-line flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700">Adjust photo</p>
            <p className="mt-1 text-base font-semibold tighter">Drag to reposition. Slider to zoom.</p>
          </div>
          <button onClick={onCancel} className="text-mute hover:text-ink text-2xl leading-none w-9 h-9 rounded-full hover:bg-soft flex items-center justify-center">×</button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div
            className="relative bg-soft overflow-hidden select-none cursor-grab active:cursor-grabbing rounded-full ring-1 ring-line"
            style={{ width: VIEWPORT, height: VIEWPORT }}
            onMouseDown={(e) => beginDrag(e.clientX, e.clientY)}
            onTouchStart={(e) => beginDrag(e.touches[0].clientX, e.touches[0].clientY)}
          >
            <img
              ref={imgRef}
              src={image}
              draggable={false}
              alt=""
              onLoad={(e) => {
                const t = e.currentTarget;
                setNatural({ w: t.naturalWidth, h: t.naturalHeight });
              }}
              style={{
                position: "absolute",
                left: "50%",
                top:  "50%",
                width:  renderedW || "auto",
                height: renderedH || "auto",
                transform: `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>

          <div className="mt-6 w-full">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-mute">
              <span>Zoom</span>
              <span>{zoom.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="mt-2 w-full accent-ink"
            />
          </div>
        </div>

        <div className="px-6 pb-5 pt-1 flex items-center justify-end gap-3 border-t border-line">
          <button onClick={onCancel} className="text-sm font-medium text-mute hover:text-ink px-3 py-2 rounded-full">Cancel</button>
          <button onClick={save} className="bg-ink text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-mute">Save photo</button>
        </div>
      </div>
    </div>
  );
}
