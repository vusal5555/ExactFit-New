"use client";

import { Users, Flame, CalendarDays, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActivityChart from "@/components/ActivityChart";
import HotLeadsList from "@/components/HotLeads";
import { LeadRecord, LeadStats, MonitorRecord } from "@/types/types";
import StatsCard from "@/components/StateCard";
import PlatformChart from "@/components/PlatformChart";
import MonitorsList from "@/components/MonitorList";
import { useRouter } from "next/navigation";

interface DashboardData {
  stats: LeadStats;
  hotLeads: LeadRecord[];
  allLeads: LeadRecord[];
  monitors: MonitorRecord[];
}

export default function DashboardClient({
  data,
  userName,
}: {
  data: DashboardData;
  userName: string;
}) {
  const { stats, hotLeads, allLeads, monitors } = data;
  const router = useRouter();

  return (
    <div className="bg-background p-6 md:p-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userName} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your intent signal overview
          </p>
        </div>
        <Button onClick={() => router.refresh()} variant="outline" size="sm">
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={stats.total_leads}
          icon={<Users className="size-5" />}
          color="blue"
          sub={`Avg score ${stats.avg_score}`}
        />
        <StatsCard
          title="Hot Leads (≥ 8)"
          value={hotLeads.length}
          icon={<Flame className="size-5" />}
          color="orange"
        />
        <StatsCard
          title="Leads Today"
          value={stats.leads_today}
          icon={<CalendarDays className="size-5" />}
          color="green"
          sub={`${stats.leads_this_week} this week`}
        />
        <StatsCard
          title="Active Monitors"
          value={monitors.length}
          icon={<Activity className="size-5" />}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Activity Overview</h2>
          <ActivityChart leads={allLeads} />
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Platform Breakdown</h2>
          <PlatformChart data={stats.leads_by_platform} />
        </div>
      </div>

      {/* Bottom */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">🔥 Latest Hot Leads</h2>
          <HotLeadsList leads={hotLeads.slice(0, 5)} />
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Active Monitors</h2>
          <MonitorsList monitors={monitors} />
        </div>
      </div>
    </div>
  );
}
