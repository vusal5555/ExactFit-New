import { createClient } from "@/lib/supabase";
import { apiFetch } from "@/lib/utils";
import { LeadRecord, MonitorRecord } from "@/types/types";
import LeadsClient from "./LeadsClient";

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    return <div>Not authenticated</div>;
  }

  const [leads, monitorsResp] = await Promise.all([
    apiFetch<LeadRecord[]>("/api/leads?limit=20&is_dismissed=false", token),
    apiFetch<{ monitors: MonitorRecord[] }>("/api/monitors", token),
  ]);

  return (
    <LeadsClient
      initialLeads={leads ?? []}
      monitors={monitorsResp.monitors ?? []}
      token={token}
    />
  );
}
