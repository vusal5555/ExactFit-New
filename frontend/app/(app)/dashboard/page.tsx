import { createClient } from "@/lib/supabase";
import { apiFetch } from "@/lib/utils";
import { LeadRecord, LeadStats, MonitorRecord } from "@/types/types";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    return <div>Not authenticated</div>;
  }

  const data = await supabase.auth.getUser();

  const [stats, hotLeads, allLeads, monitorsResp] = await Promise.all([
    apiFetch<LeadStats>("/api/leads/stats", token),
    apiFetch<LeadRecord[]>(
      "/api/leads?sort_by=intent_score&min_score=8&limit=100",
      token,
    ),
    apiFetch<LeadRecord[]>("/api/leads?limit=500", token),
    apiFetch<{ monitors: MonitorRecord[] }>("/api/monitors", token),
  ]);

  const userName = data?.data?.user?.email?.split("@")[0];

  return (
    <DashboardClient
      data={{ stats, hotLeads, allLeads, monitors: monitorsResp.monitors }}
      userName={userName || "User"}
    ></DashboardClient>
  );
}
