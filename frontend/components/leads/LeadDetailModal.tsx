"use client";

import { useState } from "react";
import { X, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { LeadRecord } from "@/types/types";
import { cn, apiMutate, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PLATFORM: Record<string, { label: string; cls: string }> = {
  hackernews: { label: "HackerNews", cls: "bg-orange-100 text-orange-700" },
  reddit: { label: "Reddit", cls: "bg-red-100 text-red-600" },
  twitter: { label: "Twitter", cls: "bg-sky-100 text-sky-700" },
  linkedin: { label: "LinkedIn", cls: "bg-blue-100 text-blue-700" },
};

const STAGE: Record<string, string> = {
  awareness: "bg-blue-100 text-blue-700",
  consideration: "bg-purple-100 text-purple-700",
  decision: "bg-orange-100 text-orange-700",
  purchase: "bg-green-100 text-green-700",
};

const URGENCY: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-600",
  low: "bg-gray-100 text-gray-600",
};

interface Props {
  lead: LeadRecord;
  token: string;
  onClose: () => void;
  onContacted: (id: string) => void;
  onDismissed: (id: string) => void;
}

export default function LeadDetailModal({
  lead,
  token,
  onClose,
  onContacted,
  onDismissed,
}: Props) {
  const [contacting, setContacting] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [contacted, setContacted] = useState(lead.is_contacted);
  const [dismissed, setDismissed] = useState(lead.is_dismissed);

  async function handleContact() {
    setContacting(true);
    try {
      await apiMutate(`/api/leads/${lead.id}/contact`, token, "PUT");
      setContacted(true);
      onContacted(lead.id);
    } finally {
      setContacting(false);
    }
  }

  async function handleDismiss() {
    setDismissing(true);
    try {
      await apiMutate(`/api/leads/${lead.id}/dismiss`, token, "PUT");
      setDismissed(true);
      onDismissed(lead.id);
      onClose();
    } finally {
      setDismissing(false);
    }
  }

  const plat = PLATFORM[lead.platform] ?? {
    label: lead.platform,
    cls: "bg-gray-100 text-gray-700",
  };
  const score = lead.intent_score;
  const scoreColor =
    score >= 8
      ? "text-green-600"
      : score >= 5
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b p-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold leading-snug">{lead.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>by {lead.author}</span>
              <span>·</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  plat.cls,
                )}
              >
                {plat.label}
              </span>
              <span>·</span>
              <span>{timeAgo(lead.created_at)}</span>
              {lead.keyword && (
                <>
                  <span>·</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {lead.keyword}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* AI Analysis scores */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              AI Analysis
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-background p-3 text-center">
                <p className="text-xs text-muted-foreground">Intent Score</p>
                <p className={cn("mt-1 text-2xl font-bold", scoreColor)}>
                  {score}
                  <span className="text-sm font-normal text-muted-foreground">
                    /10
                  </span>
                </p>
              </div>
              <div className="rounded-xl border bg-background p-3 text-center">
                <p className="text-xs text-muted-foreground">Buying Stage</p>
                <span
                  className={cn(
                    "mt-2 inline-block rounded-full px-2 py-0.5 text-xs capitalize font-medium",
                    STAGE[lead.buying_stage] ?? "bg-gray-100 text-gray-700",
                  )}
                >
                  {lead.buying_stage}
                </span>
              </div>
              <div className="rounded-xl border bg-background p-3 text-center">
                <p className="text-xs text-muted-foreground">Urgency</p>
                <span
                  className={cn(
                    "mt-2 inline-block rounded-full px-2 py-0.5 text-xs capitalize font-medium",
                    URGENCY[lead.urgency] ?? "bg-gray-100 text-gray-600",
                  )}
                >
                  {lead.urgency}
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Action */}
          {lead.recommended_action && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                Recommended Action
              </p>
              <p className="text-sm">{lead.recommended_action}</p>
            </div>
          )}

          {/* Pain Points */}
          {lead.pain_points && lead.pain_points.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pain Points
              </h3>
              <ul className="space-y-1.5">
                {lead.pain_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reasoning */}
          {lead.reasoning && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reasoning
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lead.reasoning}
              </p>
            </div>
          )}

          {/* Post Content */}
          {lead.content && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Post Content
              </h3>
              <p className="whitespace-pre-line rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground leading-relaxed">
                {lead.content}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t p-4">
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            Open Original Post
          </a>

          <div className="flex items-center gap-2">
            {!dismissed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                disabled={dismissing}
              >
                {dismissing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <XCircle className="size-4" />
                )}
                Dismiss
              </Button>
            )}

            {!contacted && !dismissed && (
              <Button size="sm" onClick={handleContact} disabled={contacting}>
                {contacting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle className="size-4" />
                )}
                Mark Contacted
              </Button>
            )}

            {contacted && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="size-4" />
                Contacted
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
