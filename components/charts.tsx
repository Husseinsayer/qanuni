// Lightweight inline SVG charts (no external chart library).
import { cn } from "@/lib/utils";

export function BarList({
  data,
  className,
}: {
  data: { name: string; value: number }[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={cn("space-y-2", className)}>
      {data.length === 0 && <p className="text-sm text-muted-foreground">لا توجد بيانات بعد.</p>}
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-muted-foreground">{d.name}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-left font-bold tabular-nums">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniBars({
  data,
  className,
}: {
  data: { date?: string; hour?: number; label?: string; visits: number }[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.visits));
  return (
    <div className={cn("flex h-32 items-end gap-1", className)}>
      {data.map((d, i) => (
        <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
          <div
            className="w-full rounded-t bg-accent/80 transition-all group-hover:bg-accent"
            style={{ height: `${(d.visits / max) * 100}%`, minHeight: d.visits > 0 ? 3 : 1 }}
            title={`${d.visits}`}
          />
        </div>
      ))}
    </div>
  );
}

export function Donut({
  data,
  size = 140,
  className,
}: {
  data: { name: string; value: number }[];
  size?: number;
  className?: string;
}) {
  const total = Math.max(1, data.reduce((s, d) => s + d.value, 0));
  const radius = size / 2 - 12;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  const colors = ["#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444", "#06B6D4", "#EC4899", "#84CC16"];
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-muted" strokeWidth={14} />
        {data.map((d, i) => {
          const len = (d.value / total) * circ;
          const el = (
            <circle
              key={d.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={14}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="space-y-1 text-sm">
        {data.slice(0, 6).map((d, i) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="font-bold">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
