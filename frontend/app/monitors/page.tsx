"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Radio, AlertTriangle } from "lucide-react";
import { browserClient } from "@/lib/browser-client";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/utils";
import { MonitorRecord } from "@/types/types";
import MonitorCard from "@/components/monitors/MonitorCard";
import CreateMonitorModal from "@/components/monitors/CreateMonitorModal";

export default function MonitorsPage() {
  const router = useRouter();
  const supabase = useMemo(() => browserClient(), []);

  const [token, setToken] = useState<string | null>(null);
  const [monitors, setMonitors] = useState<MonitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push("/login");
        return;
      }

      setToken(session.access_token);
      const res = await apiFetch<{ monitors: MonitorRecord[] }>(
        "/api/monitors",
        session.access_token,
      );
      setMonitors(res.monitors ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load monitors");
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    load();
  }, [load]);

  function handleCreated(monitor: MonitorRecord) {
    setMonitors((prev) => [monitor, ...prev]);
    setShowCreate(false);
  }

  function handleUpdated(updated: MonitorRecord) {
    setMonitors((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleDeleted(id: string) {
    setMonitors((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <RefreshCw className="mr-2 size-4 animate-spin" />
        Loading monitors…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5" />
          <p>{error}</p>
        </div>
        <Button onClick={load} variant="outline" size="sm">
          <RefreshCw className="size-4" /> Retry
        </Button>
      </div>
    );
  }

  const activeCount = monitors.filter((m) => m.is_active).length;

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Monitors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {monitors.length > 0
              ? `${monitors.length} monitor${monitors.length !== 1 ? "s" : ""} · ${activeCount} active`
              : "Track intent signals across platforms"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={load} variant="outline" size="sm">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="size-4" />
            New Monitor
          </Button>
        </div>
      </div>

      {/* Content */}
      {monitors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Radio className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No monitors yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first monitor to start tracking intent signals across
            HackerNews, Reddit, Twitter, and LinkedIn.
          </p>
          <Button onClick={() => setShowCreate(true)} className="mt-6">
            <Plus className="size-4" />
            Create your first monitor
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {monitors.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              token={token!}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && token && (
        <CreateMonitorModal
          token={token}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
