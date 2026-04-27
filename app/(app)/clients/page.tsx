"use client";

import { useState } from "react";
import type { Client } from "@/types";
import { fmt, formatPhone } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useClients, addClient, removeClient } from "@/lib/clients-store";
import ClientDrawer from "./ClientDrawer";

export default function ClientsPage() {
  const clients = useClients();
  const [showAdd, setShowAdd] = useState(false);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const openClient = openClientId ? clients.find((c) => c.id === openClientId) ?? null : null;

  const buyers   = clients.filter((c) => c.status === "Active Buyer");
  const sellers  = clients.filter((c) => c.status === "Active Seller");
  const leads    = clients.filter((c) => c.status === "Lead");
  const past     = clients.filter((c) => c.status === "Closed");
  const nurture  = clients.filter((c) => c.status === "Nurture");

  return (
    <div className="p-7 space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600">Clients</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold tighter leading-tight">Your sphere.</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-mute shadow-md shadow-black/5"
        >
          + Add client
        </button>
      </div>

      <Tabs
        tabs={[
          { id: "all",     label: "All",     count: clients.length },
          { id: "buyers",  label: "Buyers",  count: buyers.length  },
          { id: "sellers", label: "Sellers", count: sellers.length },
          { id: "leads",   label: "Leads",   count: leads.length   },
          { id: "past",    label: "Past clients", count: past.length },
          { id: "nurture", label: "Nurture", count: nurture.length },
        ]}
      >
        {(active) => {
          const list = ({ all: clients, buyers, sellers, leads, past, nurture } as Record<string, Client[]>)[active] ?? clients;
          return <ClientList list={list} onRemove={removeClient} onOpen={setOpenClientId} />;
        }}
      </Tabs>

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
      <ClientDrawer client={openClient} onClose={() => setOpenClientId(null)} />
    </div>
  );
}

function ClientList({ list, onRemove, onOpen }: { list: Client[]; onRemove: (id: string) => void; onOpen: (id: string) => void }) {
  if (list.length === 0)
    return <Card><p className="text-sm text-slate-500">No clients in this view.</p></Card>;

  const tone = (s: string) => {
    if (s.includes("Buyer"))  return "blue";
    if (s.includes("Seller")) return "emerald";
    if (s === "Lead")         return "amber";
    if (s === "Nurture")      return "purple";
    return "slate";
  };

  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left  px-5 py-3 font-semibold">Name</th>
            <th className="text-left  px-5 py-3 font-semibold">Status</th>
            <th className="text-left  px-5 py-3 font-semibold">Type</th>
            <th className="text-right px-5 py-3 font-semibold">Budget</th>
            <th className="text-left  px-5 py-3 font-semibold">Source</th>
            <th className="text-right px-5 py-3 font-semibold">Last contact</th>
            <th className="text-right px-5 py-3 font-semibold w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {list.map((c) => (
            <tr
              key={c.id}
              onClick={() => onOpen(c.id)}
              className="hover:bg-slate-50 group cursor-pointer"
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-slate-400">{c.email ?? c.phone ?? ""}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3"><Badge tone={tone(c.status) as any}>{c.status}</Badge></td>
              <td className="px-5 py-3 text-slate-600">{c.type ?? "—"}</td>
              <td className="px-5 py-3 text-right font-mono text-slate-900">{c.budget ? fmt(c.budget) : "—"}</td>
              <td className="px-5 py-3 text-slate-600 text-xs">{c.source ?? "—"}</td>
              <td className="px-5 py-3 text-right text-slate-500 text-xs">
                {c.lastContact ? new Date(c.lastContact).toLocaleDateString() : "—"}
              </td>
              <td className="px-2 py-3 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove ${c.firstName} ${c.lastName}?`)) onRemove(c.id);
                  }}
                  title="Remove client"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-600 text-lg leading-none w-7 h-7 rounded-full hover:bg-rose-50"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ── Add-client modal ─────────────────────────────────────────────────────
function AddClientModal({ onClose }: { onClose: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [status, setStatus]       = useState<Client["status"]>("Lead");
  const [type, setType]           = useState<NonNullable<Client["type"]>>("Buyer");
  const [budget, setBudget]       = useState("");
  const [source, setSource]       = useState("Referral");
  const [notes, setNotes]         = useState("");

  const submit = () => {
    if (!firstName || !lastName) return;
    addClient({
      firstName, lastName,
      email: email || null,
      phone: phone || null,
      status,
      type,
      budget: budget ? Number(budget.replace(/[^0-9]/g, "")) : null,
      preApproved: false,
      assignedListings: [],
      notes,
      lastContact: new Date().toISOString().slice(0, 10),
      source,
    } as Omit<Client, "id" | "createdAt">);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-line shadow-2xl shadow-black/20 overflow-hidden">
        <div className="px-7 pt-6 pb-4 border-b border-line flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600">Add client</p>
            <p className="mt-1 text-lg font-semibold tighter">A new face in the book.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-ink text-2xl leading-none">×</button>
        </div>
        <div className="px-7 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ModalField label="First name"><ModalInput value={firstName} onChange={setFirstName} placeholder="Jennifer" autoFocus /></ModalField>
            <ModalField label="Last name"><ModalInput value={lastName} onChange={setLastName} placeholder="Walsh" /></ModalField>
            <ModalField label="Email"><ModalInput value={email} onChange={setEmail} placeholder="jennifer@gmail.com" type="email" /></ModalField>
            <ModalField label="Phone"><ModalInput value={phone} onChange={(v) => setPhone(formatPhone(v))} placeholder="(512) 555-0188" /></ModalField>
            <ModalField label="Status">
              <ModalSelect
                value={status}
                onChange={(v) => setStatus(v as Client["status"])}
                options={[
                  { value: "Lead",          label: "Lead"          },
                  { value: "Active Buyer",  label: "Active Buyer"  },
                  { value: "Active Seller", label: "Active Seller" },
                  { value: "Nurture",       label: "Nurture"       },
                  { value: "Closed",        label: "Past client"   },
                ]}
              />
            </ModalField>
            <ModalField label="Type">
              <ModalSelect
                value={type}
                onChange={(v) => setType(v as NonNullable<Client["type"]>)}
                options={[
                  { value: "Buyer",  label: "Buyer"  },
                  { value: "Seller", label: "Seller" },
                  { value: "Both",   label: "Both"   },
                ]}
              />
            </ModalField>
            <ModalField label="Budget (USD)"><ModalInput value={budget} onChange={setBudget} placeholder="900000" /></ModalField>
            <ModalField label="Source"><ModalInput value={source} onChange={setSource} placeholder="Referral" /></ModalField>
          </div>
          <ModalField label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything you'd want a co-agent to know after one read."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-sm text-ink focus:border-amber-500 focus:outline-none placeholder:text-mute/60"
            />
          </ModalField>
        </div>
        <div className="px-7 pb-6 pt-2 flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-mute hover:text-ink px-3 py-2 rounded-full">Cancel</button>
          <button
            disabled={!firstName || !lastName}
            onClick={submit}
            className="bg-ink text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-mute disabled:bg-line disabled:text-mute/70 disabled:cursor-not-allowed"
          >
            Add to clients
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-mute">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
function ModalInput({
  value, onChange, placeholder, type = "text", autoFocus,
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; autoFocus?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-sm text-ink focus:border-amber-500 focus:outline-none placeholder:text-mute/60"
    />
  );
}
function ModalSelect({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-sm text-ink focus:border-amber-500 focus:outline-none"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
