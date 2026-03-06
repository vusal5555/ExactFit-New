"use client";

import { useState } from "react";
import {
  Clock,
  Zap,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  PowerOff,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonitorRecord } from "@/types/types";
import { apiMutate, timeAgo } from "@/lib/utils";

const PLATFORM_LABELS: Record<string, string> = {
  hackernews: "HackerNews",
  reddit: "Reddit",
  twitter: "Twitter",
  linkedin: "LinkedIn",
};

const ALL_PLATFORMS = ["hackernews", "reddit", "twitter", "linkedin"];

interface Props {
  monitor: MonitorRecord;
  token: string;
  onUpdated: (monitor: MonitorRecord) => void;
  onDeleted: (id: string) => void;
}

export default function MonitorCard({
  monitor,
  token,
  onUpdated,
  onDeleted,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  // edit state
  const [editKeyword, setEditKeyword] = useState(monitor.keyword);
  const [editPlatforms, setEditPlatforms] = useState<string[]>(
    monitor.platforms,
  );
  const [editScore, setEditScore] = useState(monitor.min_intent_score);

  function toggleEditPlatform(id: string) {
    setEditPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    if (!editKeyword.trim() || editPlatforms.length === 0) return;
    setSaving(true);
    try {
      const res = await apiMutate<{ monitor: MonitorRecord }>(
        `/api/monitors/${monitor.id}`,
        token,
        "PUT",
        {
          keyword: editKeyword.trim(),
          platforms: editPlatforms,
          min_intent_score: editScore,
        },
      );
      onUpdated(res.monitor);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiMutate(`/api/monitors/${monitor.id}`, token, "DELETE");
      onDeleted(monitor.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleToggleStatus() {
    setToggling(true);
    try {
      const res = await apiMutate<{ monitor: MonitorRecord }>(
        `/api/monitors/${monitor.id}`,
        token,
        "PUT",
        { is_active: !monitor.is_active },
      );
      onUpdated(res.monitor);
    } finally {
      setToggling(false);
    }
  }

  async function handleScanNow() {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await apiMutate<{
        qualified_leads: number;
        new_posts: number;
        total_scraped: number;
      }>(`/api/leads/scan/${monitor.id}`, token, "POST");
      setScanResult(
        `Found ${res.qualified_leads} new lead${res.qualified_leads !== 1 ? "s" : ""} from ${res.total_scraped} posts`,
      );
    } catch {
      setScanResult("Scan failed — check your API connections.");
    } finally {
      setScanning(false);
    }
  }

  function cancelEdit() {
    setEditKeyword(monitor.keyword);
    setEditPlatforms(monitor.platforms);
    setEditScore(monitor.min_intent_score);
    setEditing(false);
  }

  return (
    <div
      className={`rounded-xl border bg-card shadow-sm transition-all ${
        monitor.is_active ? "border-border" : "border-border/50 opacity-70"
      }`}
    >
      <div className="p-5">
        {editing ? (
          /* ── Edit Mode ── */
          <div className="space-y-4">
            <input
              type="text"
              value={editKeyword}
              onChange={(e) => setEditKeyword(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <div className="grid grid-cols-2 gap-2">
              {ALL_PLATFORMS.map((id) => {
                const checked = editPlatforms.includes(id);
                return (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      checked
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEditPlatform(id)}
                      className="size-3 accent-primary"
                    />
                    {PLATFORM_LABELS[id]}
                  </label>
                );
              })}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Min score</span>
                <span className="font-semibold text-primary">{editScore}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={editScore}
                onChange={(e) => setEditScore(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEdit}
                className="flex-1"
              >
                <X className="size-3.5" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={
                  saving || !editKeyword.trim() || editPlatforms.length === 0
                }
                className="flex-1"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                Save
              </Button>
            </div>
          </div>
        ) : (
          /* ── View Mode ── */
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">
                    "{monitor.keyword}"
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      monitor.is_active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {monitor.is_active ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {monitor.platforms
                    .map((p) => PLATFORM_LABELS[p] ?? p)
                    .join(", ")}{" "}
                  &middot; Min score{" "}
                  <span className="font-medium text-foreground">
                    {monitor.min_intent_score}
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  title={
                    monitor.is_active ? "Pause monitor" : "Activate monitor"
                  }
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                >
                  {toggling ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : monitor.is_active ? (
                    <PowerOff className="size-4" />
                  ) : (
                    <Power className="size-4" />
                  )}
                </button>
                <button
                  title="Edit monitor"
                  onClick={() => setEditing(true)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </button>
                {confirmDelete ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="rounded-md p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {deleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    title="Delete monitor"
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Footer row */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {monitor.last_scanned_at
                  ? `Scanned ${timeAgo(monitor.last_scanned_at)}`
                  : "Never scanned"}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleScanNow}
                disabled={scanning}
                className="h-7 gap-1.5 text-xs"
              >
                {scanning ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Zap className="size-3" />
                )}
                {scanning ? "Scanning…" : "Scan Now"}
              </Button>
            </div>

            {scanResult && (
              <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                {scanResult}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
