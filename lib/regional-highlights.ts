"use client";

import { useEffect, useState } from "react";

export interface RegionalHighlight {
  id: string;
  regionSlug: string;     // matches lib/brief/regions.ts slug
  regionLabel: string;    // human label snapshot
  note: string;           // freeform text the user typed
  pinned: boolean;        // pinned highlights stick visually at top
  createdAt: string;
}

const KEY   = "atrium:regional-highlights:v1";
const EVENT = "atrium:highlights-changed";

function read(): RegionalHighlight[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RegionalHighlight[]) : [];
  } catch {
    return [];
  }
}

function write(list: RegionalHighlight[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function addHighlight(input: Omit<RegionalHighlight, "id" | "createdAt">): RegionalHighlight {
  const item: RegionalHighlight = {
    ...input,
    id: `HL-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };
  write([item, ...read()]);
  return item;
}

export function removeHighlight(id: string) {
  write(read().filter((h) => h.id !== id));
}

export function togglePinHighlight(id: string) {
  write(read().map((h) => (h.id === id ? { ...h, pinned: !h.pinned } : h)));
}

export function useHighlights(): RegionalHighlight[] {
  const [list, setList] = useState<RegionalHighlight[]>([]);
  useEffect(() => {
    const sync = () => setList(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
