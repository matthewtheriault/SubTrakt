import { formatCurrency } from "../lib/format";

export interface CategoryDatum {
  category: string;
  monthly: number;
  color: string;
}

interface CategoryBreakdownProps {
  data: CategoryDatum[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Add a subscription to see your spending by category.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.monthly));

  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => {
        const pct = max > 0 ? Math.max((d.monthly / max) * 100, 3) : 0;
        return (
          <div key={d.category} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                {d.category}
              </span>
              <span className="tabular-nums" style={{ color: "var(--text-secondary)" }}>
                {formatCurrency(d.monthly)}
                <span style={{ color: "var(--text-muted)" }}> /mo</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${pct}%`, background: d.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
