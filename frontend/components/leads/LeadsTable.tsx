"use client";

import { useState } from "react";
import { ExternalLink, Eye, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { LeadRecord } from "@/types/types";
import { cn, apiMutate, timeAgo } from "@/lib/utils";

const PLATFORM: Record<string, { label: string; cls: string }> = {
  hackernews: { label: "HN", cls: "bg-orange-100 text-orange-700" },
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

function scoreClass(score: number) {
  if (score >= 8) return "bg-green-100 text-green-700";
  if (score >= 5) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

interface Props {
  leads: LeadRecord[];
  loading: boolean;
  token: string;
  onSelect: (lead: LeadRecord) => void;
  onContacted: (id: string) => void;
  onDismissed: (id: string) => void;
}

export default function LeadsTable({
  leads,
  loading,
  token,
  onSelect,
  onContacted,
  onDismissed,
}: Props) {
  const [mutating, setMutating] = useState<Record<string, boolean>>({});

  function setMut(key: string, val: boolean) {
    setMutating((prev) => ({ ...prev, [key]: val }));
  }

  async function handleContact(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setMut(`${id}_c`, true);
    try {
      await apiMutate(`/api/leads/${id}/contact`, token, "PUT");
      onContacted(id);
    } finally {
      setMut(`${id}_c`, false);
    }
  }

  async function handleDismiss(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setMut(`${id}_d`, true);
    try {
      await apiMutate(`/api/leads/${id}/dismiss`, token, "PUT");
      onDismissed(id);
    } finally {
      setMut(`${id}_d`, false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading leads…
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <p className="text-muted-foreground">
          No leads match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {[
              "Title",
              "Author",
              "Platform",
              "Score",
              "Stage",
              "Urgency",
              "Found",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className={cn(
                  "px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                  h === "Actions" ? "text-right" : "text-left",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {leads.map((lead) => {
            const plat = PLATFORM[lead.platform] ?? {
              label: lead.platform,
              cls: "bg-gray-100 text-gray-700",
            };
            return (
              <tr
                key={lead.id}
                onClick={() => onSelect(lead)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/40",
                  lead.is_dismissed && "opacity-40",
                )}
              >
                {/* Title */}
                <td className="max-w-xs px-4 py-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-medium leading-snug">
                        {lead.title}
                      </p>
                      {lead.is_contacted && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="size-3" /> Contacted
                        </span>
                      )}
                    </div>
                    <a
                      href={lead.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                      title="Open original post"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </td>

                {/* Author */}
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {lead.author}
                </td>

                {/* Platform */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      plat.cls,
                    )}
                  >
                    {plat.label}
                  </span>
                </td>

                {/* Score */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      scoreClass(lead.intent_score),
                    )}
                  >
                    {lead.intent_score}
                  </span>
                </td>

                {/* Stage */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs capitalize",
                      STAGE[lead.buying_stage] ?? "bg-gray-100 text-gray-700",
                    )}
                  >
                    {lead.buying_stage}
                  </span>
                </td>

                {/* Urgency */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs capitalize",
                      URGENCY[lead.urgency] ?? "bg-gray-100 text-gray-600",
                    )}
                  >
                    {lead.urgency}
                  </span>
                </td>

                {/* Date */}
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {timeAgo(lead.created_at)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(lead);
                      }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="View Details"
                    >
                      <Eye className="size-4" />
                    </button>

                    {!lead.is_contacted && (
                      <button
                        onClick={(e) => handleContact(e, lead.id)}
                        disabled={mutating[`${lead.id}_c`]}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                        title="Mark Contacted"
                      >
                        {mutating[`${lead.id}_c`] ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle className="size-4" />
                        )}
                      </button>
                    )}

                    {!lead.is_dismissed && (
                      <button
                        onClick={(e) => handleDismiss(e, lead.id)}
                        disabled={mutating[`${lead.id}_d`]}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Dismiss"
                      >
                        {mutating[`${lead.id}_d`] ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <XCircle className="size-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
