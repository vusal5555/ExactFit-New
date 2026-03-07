import { apiFetch } from "@/lib/utils";
import MonitorsClient from "./MonitorsClient";
import { MonitorRecord } from "@/types/types";
import { createClient } from "@/lib/supabase";

export default async function MonitorsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    return <div>Not authenticated</div>;
  }

  const res = await apiFetch<{ monitors: MonitorRecord[] }>(
    "/api/monitors",
    token,
  );

  return <MonitorsClient monitors={res.monitors ?? []} token={token} />;
}
