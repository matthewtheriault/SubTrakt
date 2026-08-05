import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "./components/Logo";
import { StatCard } from "./components/StatCard";
import { CategoryBreakdown, type CategoryDatum } from "./components/CategoryBreakdown";
import { SubscriptionRow } from "./components/SubscriptionRow";
import { SubscriptionForm } from "./components/SubscriptionForm";
import { SettingsPanel } from "./components/SettingsPanel";
import { useSubscriptions } from "./useSubscriptions";
import { useSettings } from "./useSettings";
import { buildCategoryColorMap } from "./lib/categoryColors";
import { formatDate, daysUntil } from "./lib/format";
import { formatMoney, toBaseCurrency } from "./lib/currency";
import { daysSince } from "./lib/dateMath";
import { reconcileSubscriptions } from "./lib/reminders";
import { DEFAULT_CATEGORIES, toBiWeekly, toMonthly, toYearly, type Subscription } from "./types";

type SortKey = "date" | "amount" | "name";
type View = "all" | "cancel-candidates" | "trials-ending";

function App() {
  const {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    markUsedToday,
    replaceAll,
  } = useSubscriptions();
  const { settings, loading: settingsLoading, updateSettings } = useSettings();

  const [formMode, setFormMode] = useState<"closed" | "new" | Subscription>("closed");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");

  const reconciledRef = useRef(false);
  useEffect(() => {
    if (reconciledRef.current || loading || settingsLoading) return;
    reconciledRef.current = true;
    reconcileSubscriptions(subscriptions, settings).then((next) => {
      if (next) replaceAll(next);
    });
    // Only ever run once, right after both stores finish their initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, settingsLoading]);

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
    const monthly = subscriptions.reduce(
      (sum, s) => sum + toBaseCurrency(toMonthly(s.amount, s.frequency), s.currency, settings),
      0,
    );
    const yearly = subscriptions.reduce(
      (sum, s) => sum + toBaseCurrency(toYearly(s.amount, s.frequency), s.currency, settings),
      0,
    );
    const biweekly = subscriptions.reduce(
      (sum, s) => sum + toBaseCurrency(toBiWeekly(s.amount, s.frequency), s.currency, settings),
      0,
    );
    return { monthly, yearly, biweekly };
  }, [subscriptions, settings]);

  const nextPayment = useMemo(() => {
    const upcoming = subscriptions
      .filter((s) => s.paymentDate)
      .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
    return upcoming[0] ?? null;
  }, [subscriptions]);

  const categoryBreakdown: CategoryDatum[] = useMemo(() => {
    const totalsByCategory = new Map<string, number>();
    for (const s of subscriptions) {
      const monthly = toBaseCurrency(toMonthly(s.amount, s.frequency), s.currency, settings);
      totalsByCategory.set(s.category, (totalsByCategory.get(s.category) ?? 0) + monthly);
    }
    return Array.from(totalsByCategory.entries())
      .map(([category, monthly]) => ({
        category,
        monthly,
        color: categoryColorMap.get(category) ?? "var(--text-muted)",
      }))
      .sort((a, b) => b.monthly - a.monthly);
  }, [subscriptions, categoryColorMap, settings]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of subscriptions) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    return counts;
  }, [subscriptions]);

  const cancelCandidates = useMemo(
    () =>
      subscriptions.filter((s) => {
        if (!s.lastUsedDate) return false;
        const unused = daysSince(s.lastUsedDate);
        return unused !== null && unused >= settings.staleAfterDays;
      }),
    [subscriptions, settings.staleAfterDays],
  );

  const trialsEndingSoon = useMemo(
    () =>
      subscriptions.filter((s) => {
        if (!s.isTrial || !s.trialEndDate) return false;
        const days = daysUntil(s.trialEndDate);
        return days !== null && days >= 0 && days <= settings.reminderDaysBefore;
      }),
    [subscriptions, settings.reminderDaysBefore],
  );

  const currenciesInUse = useMemo(
    () => Array.from(new Set(subscriptions.map((s) => s.currency))),
    [subscriptions],
  );

  const visibleSubscriptions = useMemo(() => {
    let list = subscriptions;
    if (activeView === "cancel-candidates") list = cancelCandidates;
    else if (activeView === "trials-ending") list = trialsEndingSoon;
    else if (activeCategory) list = list.filter((s) => s.category === activeCategory);

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
      if (sortKey === "amount") {
        const am = toBaseCurrency(toMonthly(a.amount, a.frequency), a.currency, settings);
        const bm = toBaseCurrency(toMonthly(b.amount, b.frequency), b.currency, settings);
        return bm - am;
      }
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return (a.paymentDate || "9999").localeCompare(b.paymentDate || "9999");
    });
    return sorted;
  }, [subscriptions, activeCategory, activeView, cancelCandidates, trialsEndingSoon, search, sortKey, settings]);

  const knownCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    subscriptions.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [subscriptions]);

  function handleFormSubmit(values: Parameters<typeof addSubscription>[0]) {
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

  function selectCategory(category: string | null) {
    setActiveCategory(category);
    setActiveView("all");
  }

  function selectView(view: View) {
    setActiveView(view);
    setActiveCategory(null);
  }

  const listTitle =
    activeView === "cancel-candidates"
      ? "Cancel candidates"
      : activeView === "trials-ending"
        ? "Trials ending soon"
        : (activeCategory ?? "All subscriptions");

  return (
    <div className="flex h-screen w-screen" style={{ background: "var(--page)" }}>
      {/* Sidebar */}
      <aside
        className="flex w-64 shrink-0 flex-col gap-6 border-r p-5 overflow-y-auto"
        style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
        data-tauri-drag-region
      >
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="text-base font-semibold tracking-tight">SubTrakt</span>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className="rounded-lg p-1.5 cursor-pointer"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
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
          <button
            type="button"
            onClick={() => selectView("all")}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm cursor-pointer"
            style={{
              background: activeView === "all" && !activeCategory ? "var(--surface-2)" : "transparent",
              color: activeView === "all" && !activeCategory ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            <span>All</span>
            <span className="tabular-nums text-xs" style={{ color: "var(--text-muted)" }}>
              {subscriptions.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => selectView("trials-ending")}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm cursor-pointer"
            style={{
              background: activeView === "trials-ending" ? "var(--surface-2)" : "transparent",
              color: activeView === "trials-ending" ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            <span>Trials ending soon</span>
            {trialsEndingSoon.length > 0 && (
              <span
                className="tabular-nums text-xs rounded-full px-1.5"
                style={{ background: "var(--status-warning)", color: "#241a00" }}
              >
                {trialsEndingSoon.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => selectView("cancel-candidates")}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm cursor-pointer"
            style={{
              background: activeView === "cancel-candidates" ? "var(--surface-2)" : "transparent",
              color: activeView === "cancel-candidates" ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            <span>Cancel candidates</span>
            {cancelCandidates.length > 0 && (
              <span
                className="tabular-nums text-xs rounded-full px-1.5"
                style={{ background: "var(--status-serious)", color: "#2a1200" }}
              >
                {cancelCandidates.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <p className="px-1 pb-1 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Categories
          </p>
          {Array.from(categoryColorMap.keys()).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => selectCategory(category)}
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
            {formatMoney(totals.monthly, settings.baseCurrency)}
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
          <StatCard label="Monthly" value={formatMoney(totals.monthly, settings.baseCurrency)} accent />
          <StatCard label="Yearly" value={formatMoney(totals.yearly, settings.baseCurrency)} />
          <StatCard label="Bi-Weekly" value={formatMoney(totals.biweekly, settings.baseCurrency)} />
          <StatCard
            label="Next Payment"
            value={nextPayment ? formatMoney(nextPayment.amount, nextPayment.currency) : "—"}
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
            {listTitle}
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
                {subscriptions.length === 0 ? "No subscriptions yet" : "Nothing here"}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {subscriptions.length === 0
                  ? "Add your first subscription to start tracking your spend."
                  : activeView === "cancel-candidates"
                    ? "Nothing unused past your threshold. Set \"Last used\" dates to track this."
                    : activeView === "trials-ending"
                      ? "No trials converting soon."
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
                  staleAfterDays={settings.staleAfterDays}
                  onEdit={() => setFormMode(sub)}
                  onDelete={() => handleDelete(sub)}
                  onMarkUsedToday={() => markUsedToday(sub.id)}
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
          defaultCurrency={settings.baseCurrency}
          onCancel={() => setFormMode("closed")}
          onSubmit={handleFormSubmit}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          currenciesInUse={currenciesInUse}
          onCancel={() => setSettingsOpen(false)}
          onSave={(next) => {
            updateSettings(next);
            setSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
