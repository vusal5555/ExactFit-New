import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Color = "blue" | "orange" | "green" | "purple";

const colorMap: Record<Color, { bg: string; text: string; icon: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500" },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    icon: "text-orange-500",
  },
  green: { bg: "bg-green-50", text: "text-green-700", icon: "text-green-500" },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: "text-purple-500",
  },
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: Color;
  sub?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  sub,
}: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn("mt-1 text-3xl font-bold", c.text)}>
            {value.toLocaleString()}
          </p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("rounded-lg p-2", c.bg, c.icon)}>{icon}</div>
      </div>
    </div>
  );
}
