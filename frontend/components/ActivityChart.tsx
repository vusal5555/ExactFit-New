"use client";

import { LeadRecord } from "@/types/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function buildActivityData(leads: LeadRecord[]) {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });

  const counts: Record<string, number> = {};
  for (const lead of leads) {
    const key = lead.created_at.slice(0, 10);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return days.map((date) => ({
    date,
    leads: counts[date] ?? 0,
    label: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));
}

export default function ActivityChart({ leads }: { leads: LeadRecord[] }) {
  const data = buildActivityData(leads);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={data}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(v?: number) => [v ?? 0, "Leads"]}
        />
        <Area
          type="monotone"
          dataKey="leads"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#leadGrad)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
