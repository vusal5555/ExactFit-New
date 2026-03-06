"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiMutate } from "@/lib/utils";
import { MonitorRecord } from "@/types/types";

const PLATFORMS = [
  { id: "hackernews", label: "HackerNews" },
  { id: "reddit", label: "Reddit" },
  { id: "twitter", label: "Twitter" },
  { id: "linkedin", label: "LinkedIn" },
];

interface Props {
  token: string;
  onClose: () => void;
  onCreated: (monitor: MonitorRecord) => void;
}

export default function CreateMonitorModal({
  token,
  onClose,
  onCreated,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([
    "hackernews",
    "reddit",
  ]);
  const [minScore, setMinScore] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function togglePlatform(id: string) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    if (platforms.length === 0) {
      setError("Select at least one platform.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiMutate<{ monitor: MonitorRecord }>(
        "/api/monitors",
        token,
        "POST",
        {
          keyword: keyword.trim(),
          platforms,
          min_intent_score: Number(minScore),
        },
      );
      onCreated(res.monitor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create monitor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">New Monitor</h2>
            <p className="text-sm text-muted-foreground">
              Track intent signals across platforms
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* Keyword */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Keyword</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder='e.g. "CRM alternatives", "cancel Salesforce"'
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          {/* Platforms */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Platforms</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(({ id, label }) => {
                const checked = platforms.includes(id);
                return (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      checked
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlatform(id)}
                      className="size-3.5 accent-primary"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Score slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Min Intent Score</label>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
                {minScore}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 — Broad</span>
              <span>10 — High intent</span>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !keyword.trim()}
            >
              {loading ? (
                "Creating…"
              ) : (
                <>
                  <Plus className="size-4" />
                  Create Monitor
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
