"use client";

import { useEffect, useState } from "react";
import type { Client } from "@/types";
import { clients as seededClients } from "@/lib/mls/data";

const KEY_ADDED     = "atrium:clients:added:v1";
const KEY_REMOVED   = "atrium:clients:removed:v1";
const KEY_OVERRIDES = "atrium:clients:overrides:v1"; // patches applied to seeded or added clients
const EVENT         = "atrium:clients-changed";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

export function getAllClients(): Client[] {
  const added: Client[]                                = readJson(KEY_ADDED, []);
  const removed: string[]                              = readJson(KEY_REMOVED, []);
  const overrides: Record<string, Partial<Client>>     = readJson(KEY_OVERRIDES, {});
  const removedSet = new Set(removed);
  return [...seededClients, ...added]
    .filter((c) => !removedSet.has(c.id))
    .map((c) => (overrides[c.id] ? { ...c, ...overrides[c.id] } : c));
}

export function addClient(input: Omit<Client, "id" | "createdAt"> & { id?: string }): Client {
  const added: Client[] = readJson(KEY_ADDED, []);
  const id = input.id ?? `USR-${Date.now().toString(36).toUpperCase()}`;
  const client: Client = {
    ...input,
    id,
    createdAt: new Date().toISOString().slice(0, 10),
  } as Client;
  writeJson(KEY_ADDED, [...added, client]);
  return client;
}

export function removeClient(id: string) {
  const added: Client[] = readJson(KEY_ADDED, []);
  const stillInAdded = added.find((c) => c.id === id);
  if (stillInAdded) {
    writeJson(KEY_ADDED, added.filter((c) => c.id !== id));
    return;
  }
  const removed: string[] = readJson(KEY_REMOVED, []);
  if (!removed.includes(id)) writeJson(KEY_REMOVED, [...removed, id]);
}

/** Apply a partial patch to any client. Works for both seeded and user-added. */
export function updateClient(id: string, patch: Partial<Client>) {
  const added: Client[] = readJson(KEY_ADDED, []);
  const inAdded = added.find((c) => c.id === id);
  if (inAdded) {
    writeJson(KEY_ADDED, added.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    return;
  }
  const overrides: Record<string, Partial<Client>> = readJson(KEY_OVERRIDES, {});
  overrides[id] = { ...overrides[id], ...patch };
  writeJson(KEY_OVERRIDES, overrides);
}

export function useClients(): Client[] {
  const [list, setList] = useState<Client[]>(seededClients);
  useEffect(() => {
    const sync = () => setList(getAllClients());
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
