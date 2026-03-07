"use client";

import { Search } from "lucide-react";
import { MonitorRecord } from "@/types/types";
import { LeadFiltersState } from "@/app/(app)/leads/LeadsClient";

const PLATFORMS = [
  { id: "", label: "All Platforms" },
  { id: "hackernews", label: "HackerNews" },
  { id: "reddit", label: "Reddit" },
  { id: "twitter", label: "Twitter" },
  { id: "linkedin", label: "LinkedIn" },
];

const BUYING_STAGES = [
  { id: "", label: "All Stages" },
  { id: "awareness", label: "Awareness" },
  { id: "consideration", label: "Consideration" },
  { id: "decision", label: "Decision" },
  { id: "purchase", label: "Purchase" },
];

const selectClass =
  "h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring";

interface Props {
  filters: LeadFiltersState;
  monitors: MonitorRecord[];
  onChange: (partial: Partial<LeadFiltersState>) => void;
}

export default function LeadFilters({ filters, monitors, onChange }: Props) {
  return (
    <div className="mb-6 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or author…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Platform</label>
          <select
            value={filters.platform}
            onChange={(e) => onChange({ platform: e.target.value })}
            className={selectClass}
          >
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Score */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">
            Min Score:{" "}
            <span className="font-medium text-foreground">
              {filters.minScore}
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={filters.minScore}
            onChange={(e) => onChange({ minScore: Number(e.target.value) })}
            className="w-32 accent-primary"
          />
        </div>

        {/* Buying Stage */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Stage</label>
          <select
            value={filters.buyingStage}
            onChange={(e) => onChange({ buyingStage: e.target.value })}
            className={selectClass}
          >
            {BUYING_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Monitor */}
        {monitors.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Monitor</label>
            <select
              value={filters.monitorId}
              onChange={(e) => onChange({ monitorId: e.target.value })}
              className={selectClass}
            >
              <option value="">All Monitors</option>
              {monitors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.keyword}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Show Dismissed */}
        <label className="flex cursor-pointer items-center gap-2 pb-0.5 text-sm">
          <input
            type="checkbox"
            checked={filters.showDismissed}
            onChange={(e) => onChange({ showDismissed: e.target.checked })}
            className="size-4 accent-primary"
          />
          <span className="text-muted-foreground">Show dismissed</span>
        </label>
      </div>
    </div>
  );
}
