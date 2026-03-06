"use client";

import { LeadRecord } from "@/types/types";

const platformStyles: Record<string, string> = {
  reddit: "bg-orange-100 text-orange-700",
  twitter: "bg-sky-100 text-sky-700",
  linkedin: "bg-blue-100 text-blue-700",
  hacker_news: "bg-amber-100 text-amber-700",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HotLeadsList({ leads }: { leads: LeadRecord[] }) {
  if (!leads.length) {
    return <p className="text-sm text-muted-foreground">No hot leads yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {leads.map((lead) => {
        const badge =
          platformStyles[lead.platform.toLowerCase()] ??
          "bg-gray-100 text-gray-700";

        return (
          <li key={lead.id}>
            <a
              href={lead.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg p-2 transition hover:bg-accent"
            >
              <span
                className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-xs font-medium uppercase ${badge}`}
              >
                {lead.platform.replace("_", " ")}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium group-hover:text-primary">
                  {lead.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  @{lead.author} · {timeAgo(lead.created_at)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1 text-sm font-bold text-orange-500">
                🔥 {lead.intent_score}
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
