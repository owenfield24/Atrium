"use client";

import { transactions } from "@/lib/saas/data";
import { fmt, fmtCompact } from "@/lib/utils";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const stages = ["Lead", "Active Search", "Offer", "Under Contract", "Closing", "Closed"] as const;

export default function TransactionsPage() {
  const buyers  = transactions.filter((t) => t.side === "Buyer");
  const sellers = transactions.filter((t) => t.side === "Seller");

  return (
    <div className="p-7 space-y-6">
      <Tabs
        tabs={[
          { id: "board",  label: "Pipeline board" },
          { id: "list",   label: "All deals", count: transactions.length },
          { id: "buyers", label: "Buyers", count: buyers.length },
          { id: "sellers",label: "Sellers", count: sellers.length },
          { id: "checklists", label: "Document checklists" },
        ]}
      >
        {(active) => {
          if (active === "board")      return <BoardView />;
          if (active === "list")       return <DealList list={transactions} />;
          if (active === "buyers")     return <DealList list={buyers}  />;
          if (active === "sellers")    return <DealList list={sellers} />;
          if (active === "checklists") return <Checklists />;
          return null;
        }}
      </Tabs>
    </div>
  );
}

function BoardView() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stages.map((stage) => {
        const inStage = transactions.filter((t) => t.stage === stage);
        const sum = inStage.reduce((s, t) => s + t.price, 0);
        return (
          <div key={stage} className="bg-slate-100/60 rounded-lg p-3 min-h-[400px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">{stage}</h3>
              <span className="text-xs text-slate-500 font-mono">{inStage.length}</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">{fmtCompact(sum)} total</p>
            <div className="space-y-2">
              {inStage.map((t) => (
                <div key={t.id} className="bg-white rounded-md p-3 shadow-sm border border-slate-200/60">
                  <p className="text-xs font-mono text-slate-400">{t.id}</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5 leading-tight">{t.address}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.client} · {t.side}</p>
                  {t.price > 0 && <p className="text-sm font-mono text-slate-900 mt-2">{fmt(t.price)}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.flags.map((f) => <Badge key={f} tone="slate">{f}</Badge>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DealList({ list }: { list: any[] }) {
  return (
    <Card padding="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold">Deal</th>
            <th className="text-left px-5 py-3 font-semibold">Stage</th>
            <th className="text-left px-5 py-3 font-semibold">Side</th>
            <th className="text-left px-5 py-3 font-semibold">Client</th>
            <th className="text-right px-5 py-3 font-semibold">Price</th>
            <th className="text-right px-5 py-3 font-semibold">Close date</th>
            <th className="text-left px-5 py-3 font-semibold">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {list.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="px-5 py-3">
                <p className="font-medium text-slate-900">{t.address}</p>
                <p className="text-xs text-slate-400 font-mono">{t.id}</p>
              </td>
              <td className="px-5 py-3"><Badge tone={t.stage === "Closed" ? "slate" : t.stage === "Closing" ? "emerald" : "amber"}>{t.stage}</Badge></td>
              <td className="px-5 py-3 text-slate-700">{t.side}</td>
              <td className="px-5 py-3 text-slate-700">{t.client}</td>
              <td className="px-5 py-3 text-right font-mono text-slate-900">{t.price ? fmt(t.price) : "—"}</td>
              <td className="px-5 py-3 text-right text-slate-600 text-xs">{t.closeDate ? new Date(t.closeDate).toLocaleDateString() : "—"}</td>
              <td className="px-5 py-3 w-40">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${t.pctDone}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 font-mono w-8 text-right">{t.pctDone}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Checklists() {
  const lists = [
    { name: "Buyer — under contract",  items: ["Buyer-broker agreement signed", "Earnest money received", "Inspection scheduled", "Appraisal ordered", "Loan contingency met", "Title commitment received", "Insurance bound", "Final walkthrough", "Funds at title", "Keys delivered"] },
    { name: "Seller — under contract", items: ["Listing agreement on file", "Seller's disclosure", "T-47 affidavit", "HOA docs delivered", "Inspection response", "Survey ordered", "Title work begun", "Closing disclosure approved", "Keys + remotes ready"] },
    { name: "Lease — Keystone",         items: ["Application + screening report", "Background + credit", "Income verification", "Lease drafted (state-aware)", "Renters' insurance verified", "Deposit receipt issued", "Move-in inspection signed"] },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {lists.map((l) => (
        <Card key={l.name}>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">{l.name}</h3>
          <ul className="space-y-2">
            {l.items.map((i, idx) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" defaultChecked={idx < 3} className="rounded border-slate-300" />
                <span className={idx < 3 ? "line-through text-slate-400" : ""}>{i}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
