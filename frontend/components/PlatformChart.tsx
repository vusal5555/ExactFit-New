import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { BAR_COLORS } from "@/lib/constants";

function PlatformChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([platform, count]) => ({
    platform:
      platform.charAt(0).toUpperCase() + platform.slice(1).replace("_", " "),
    count,
  }));

  if (!chartData.length) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="platform"
          tick={{ fontSize: 12 }}
          width={90}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(v: number | undefined) => [v ?? 0, "Leads"]}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default PlatformChart;
