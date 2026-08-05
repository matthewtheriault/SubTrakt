import { useMemo, useState } from "react";
import { Logo } from "./components/Logo";
import { StatCard } from "./components/StatCard";
import { CategoryBreakdown, type CategoryDatum } from "./components/CategoryBreakdown";
import { SubscriptionRow } from "./components/SubscriptionRow";
import { SubscriptionForm } from "./components/SubscriptionForm";
import { useSubscriptions } from "./useSubscriptions";
import { buildCategoryColorMap } from "./lib/categoryColors";
import { formatCurrency, formatDate } from "./lib/format";
import { DEFAULT_CATEGORIES, toBiWeekly, toMonthly, toYearly, type Subscription } from "./types";

type SortKey = "date" | "amount" | "name";

function App() {
  const { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription } =
    useSubscriptions();

  const [formMode, setFormMode] = useState<"closed" | "new" | Subscription>("closed");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");

  const categoryColorMap = useMemo(() => {
    const firstSeen: string[] = [];
    for (const s of [...subscriptions].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      if (!firstSeen.includes(s.category)) firstSeen.push(s.category);
    }
    const ordered = [
      ...DEFAULT_CATEGORIES.filter((c) => firstSeen.includes(c)),
      ...firstSeen.filter((c) => !(DEFAULT_CATEGORIES as readonly string[]).includes(c)),
    ];
    return buildCategoryColorMap(ordered);
  }, [subscriptions]);

  const totals = useMemo(() => {
    const monthly = subscriptions.reduce((sum, s) => sum + toMonthly(s.amount, s.frequency), 0);
    const yearly = subscriptions.reduce((sum, s) => sum + toYearly(s.amount, s.frequency), 0);
    const biweekly = subscriptions.reduce((sum, s) => sum + toBiWeekly(s.amount, s.frequency), 0);
    return { monthly, yearly, biweekly };
  }, [subscriptions]);

  const nextPayment = useMemo(() => {
    const upcoming = subscriptions
      .filter((s) => s.paymentDate)
      .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
    return upcoming[0] ?? null;
  }, [subscriptions]);

  const categoryBreakdown: CategoryDatum[] = useMemo(() => {
    const totalsByCategory = new Map<string, number>();
    for (const s of subscriptions) {
      const monthly = toMonthly(s.amount, s.frequency);
      totalsByCategory.set(s.category, (totalsByCategory.get(s.category) ?? 0) + monthly);
    }
    return Array.from(totalsByCategory.entries())
      .map(([category, monthly]) => ({
        category,
        monthly,
        color: categoryColorMap.get(category) ?? "var(--text-muted)",
      }))
      .sort((a, b) => b.monthly - a.monthly);
  }, [subscriptions, categoryColorMap]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of subscriptions) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    return counts;
  }, [subscriptions]);

  const visibleSubscriptions = useMemo(() => {
    let list = subscriptions;
    if (activeCategory) list = list.filter((s) => s.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.account.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortKey === "amount") return toMonthly(b.amount, b.frequency) - toMonthly(a.amount, a.frequency);
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return (a.paymentDate || "9999").localeCompare(b.paymentDate || "9999");
    });
    return sorted;
  }, [subscriptions, activeCategory, search, sortKey]);

  const knownCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    subscriptions.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [subscriptions]);

  function handleFormSubmit(values: Omit<Subscription, "id" | "createdAt" | "updatedAt">) {
    if (formMode !== "closed" && formMode !== "new") {
      updateSubscription(formMode.id, values);
    } else {
      addSubscription(values);
    }
    setFormMode("closed");
  }

  function handleDelete(sub: Subscription) {
    if (window.confirm(`Delete "${sub.name}"? This can't be undone.`)) {
      deleteSubscription(sub.id);
    }
  }

  return (
    <div className="flex h-screen w-screen" style={{ background: "var(--page)" }}>
      {/* Sidebar */}
      <aside
        className="flex w-64 shrink-0 flex-col gap-6 border-r p-5"
        style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
        data-tauri-drag-region
      >
        <div className="flex items-center gap-2.5 pt-1">
          <Logo size={30} />
          <span className="text-base font-semibold tracking-tight">SubTrakt</span>
        </div>

        <button
          type="button"
          onClick={() => setFormMode("new")}
          className="w-full rounded-lg py-2 text-sm font-semibold cursor-pointer"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          + Add Subscription
        </button>

        <div className="flex flex-col gap-1">
          <p className="px-1 pb-1 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Categories
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm cursor-pointer"
            style={{
              background: activeCategory === null ? "var(--surface-2)" : "transparent",
              color: activeCategory === null ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            <span>All</span>
            <span className="tabular-nums text-xs" style={{ color: "var(--text-muted)" }}>
              {subscriptions.length}
            </span>
          </button>
          {Array.from(categoryColorMap.keys()).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm cursor-pointer"
              style={{
                background: activeCategory === category ? "var(--surface-2)" : "transparent",
                color: activeCategory === category ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              <span className="flex items-center gap-2 truncate">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: categoryColorMap.get(category) }}
                />
                <span className="truncate">{category}</span>
              </span>
              <span className="tabular-nums text-xs" style={{ color: "var(--text-muted)" }}>
                {categoryCounts.get(category) ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Monthly spend
          </p>
          <p className="text-lg font-semibold tabular-nums" style={{ color: "var(--accent)" }}>
            {formatCurrency(totals.monthly)}
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6 gap-6">
        <header className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriptions, accounts, categories…"
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            style={{ background: "var(--surface-1)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg border px-3 py-2 text-sm outline-none cursor-pointer"
            style={{ background: "var(--surface-1)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <option value="date">Sort: Upcoming</option>
            <option value="amount">Sort: Amount</option>
            <option value="name">Sort: Name</option>
          </select>
        </header>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Monthly" value={formatCurrency(totals.monthly)} accent />
          <StatCard label="Yearly" value={formatCurrency(totals.yearly)} />
          <StatCard label="Bi-Weekly" value={formatCurrency(totals.biweekly)} />
          <StatCard
            label="Next Payment"
            value={nextPayment ? formatCurrency(nextPayment.amount) : "—"}
            hint={nextPayment ? `${nextPayment.name} · ${formatDate(nextPayment.paymentDate)}` : "Nothing scheduled"}
          />
        </section>

        <section className="rounded-xl border p-5" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Spend by category
          </h2>
          <CategoryBreakdown data={categoryBreakdown} />
        </section>

        <section className="flex flex-1 flex-col gap-2 pb-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {activeCategory ?? "All subscriptions"}
            <span className="ml-2 font-normal" style={{ color: "var(--text-muted)" }}>
              {visibleSubscriptions.length}
            </span>
          </h2>

          {loading ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Loading…
            </p>
          ) : visibleSubscriptions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {subscriptions.length === 0 ? "No subscriptions yet" : "Nothing matches"}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {subscriptions.length === 0
                  ? "Add your first subscription to start tracking your spend."
                  : "Try a different search or category."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleSubscriptions.map((sub) => (
                <SubscriptionRow
                  key={sub.id}
                  sub={sub}
                  color={categoryColorMap.get(sub.category) ?? "var(--text-muted)"}
                  onEdit={() => setFormMode(sub)}
                  onDelete={() => handleDelete(sub)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {formMode !== "closed" && (
        <SubscriptionForm
          initial={formMode === "new" ? undefined : formMode}
          categories={knownCategories}
          onCancel={() => setFormMode("closed")}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

export default App;
