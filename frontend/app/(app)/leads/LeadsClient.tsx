"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LeadRecord, MonitorRecord } from "@/types/types";
import LeadFilters from "@/components/leads/LeadFilters";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadDetailModal from "@/components/leads/LeadDetailModal";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;
const API_BASE = "http://localhost:8000";

export interface LeadFiltersState {
  platform: string;
  minScore: number;
  buyingStage: string;
  showDismissed: boolean;
  monitorId: string;
  search: string;
}

function buildParams(f: LeadFiltersState, offset: number): string {
  const p = new URLSearchParams();
  if (f.platform) p.set("platform", f.platform);
  if (f.minScore > 1) p.set("min_score", String(f.minScore));
  if (f.buyingStage) p.set("buying_stage", f.buyingStage);
  if (!f.showDismissed) p.set("is_dismissed", "false");
  if (f.monitorId) p.set("monitor_id", f.monitorId);
  p.set("limit", String(PAGE_SIZE));
  p.set("offset", String(offset));
  return p.toString();
}

export default function LeadsClient({
  initialLeads,
  monitors,
  token,
}: {
  initialLeads: LeadRecord[];
  monitors: MonitorRecord[];
  token: string;
}) {
  const [leads, setLeads] = useState<LeadRecord[]>(initialLeads);
  const [filters, setFilters] = useState<LeadFiltersState>({
    platform: "",
    minScore: 1,
    buyingStage: "",
    showDismissed: false,
    monitorId: "",
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(initialLeads.length === PAGE_SIZE);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const didMount = useRef(false);

  const fetchLeads = useCallback(
    async (f: LeadFiltersState, off: number): Promise<LeadRecord[]> => {
      const res = await fetch(`${API_BASE}/api/leads?${buildParams(f, off)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
    [token],
  );

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    setLoading(true);
    setOffset(0);
    fetchLeads(filters, 0)
      .then((data) => {
        setLeads(data);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [
    filters.platform,
    filters.minScore,
    filters.buyingStage,
    filters.showDismissed,
    filters.monitorId,
    fetchLeads,
  ]);

  async function handleLoadMore() {
    const newOffset = offset + PAGE_SIZE;
    setLoading(true);
    try {
      const data = await fetchLeads(filters, newOffset);
      setLeads((prev) => [...prev, ...data]);
      setOffset(newOffset);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleContacted(id: string) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, is_contacted: true } : l)),
    );
    if (selectedLead?.id === id) {
      setSelectedLead((prev) =>
        prev ? { ...prev, is_contacted: true } : null,
      );
    }
  }

  function handleDismissed(id: string) {
    setLeads((prev) =>
      filters.showDismissed
        ? prev.map((l) => (l.id === id ? { ...l, is_dismissed: true } : l))
        : prev.filter((l) => l.id !== id),
    );
    if (selectedLead?.id === id) setSelectedLead(null);
  }

  function handleFilterChange(partial: Partial<LeadFiltersState>) {
    setFilters((prev) => ({ ...prev, ...partial }));
  }

  const filtered = filters.search
    ? leads.filter((l) => {
        const q = filters.search.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          l.author.toLowerCase().includes(q)
        );
      })
    : leads;

  return (
    <div className="bg-background p-6 md:p-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} lead{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <LeadFilters
        filters={filters}
        monitors={monitors}
        onChange={handleFilterChange}
      />

      <LeadsTable
        leads={filtered}
        loading={loading}
        token={token}
        onSelect={setSelectedLead}
        onContacted={handleContacted}
        onDismissed={handleDismissed}
      />

      {hasMore && !filters.search && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
            Load More
          </Button>
        </div>
      )}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          token={token}
          onClose={() => setSelectedLead(null)}
          onContacted={handleContacted}
          onDismissed={handleDismissed}
        />
      )}
    </div>
  );
}
