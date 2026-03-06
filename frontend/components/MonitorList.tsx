import { timeAgo } from "@/lib/utils";
import { MonitorRecord } from "@/types/types";

import { Clock } from "lucide-react";

function MonitorsList({ monitors }: { monitors: MonitorRecord[] }) {
  if (!monitors.length) {
    return (
      <p className="text-sm text-muted-foreground">No monitors configured.</p>
    );
  }
  return (
    <ul className="space-y-3">
      {monitors.map((m) => (
        <li key={m.id} className="flex items-start justify-between text-sm">
          <div className="min-w-0 flex-1">
            <p className="font-medium">"{m.keyword}"</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {m.platforms.join(", ")} &middot; min score {m.min_intent_score}
            </p>
          </div>
          <div className="ml-4 flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {m.last_scanned_at ? timeAgo(m.last_scanned_at) : "Never scanned"}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default MonitorsList;
