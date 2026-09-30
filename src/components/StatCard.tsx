interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

export function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-1"
      style={{
        background: "var(--surface-1)",
        borderColor: accent ? "transparent" : "var(--border)",
        boxShadow: accent ? "var(--accent-glow)" : undefined,
      }}
    >
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span
        className={accent ? "text-3xl font-semibold tabular-nums" : "text-2xl font-semibold tabular-nums"}
        style={{ color: accent ? "var(--accent)" : "var(--text-primary)" }}
      >
        {value}
      </span>
      {hint && (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {hint}
        </span>
      )}
    </div>
  );
}
