// Fixed categorical order — never cycled or reassigned. The 9th+ distinct
// category falls back to a neutral muted tone rather than repeating a hue.
const SLOTS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];
const FALLBACK = "var(--text-muted)";

export function buildCategoryColorMap(categoriesInFirstSeenOrder: string[]) {
  const map = new Map<string, string>();
  categoriesInFirstSeenOrder.forEach((category, i) => {
    map.set(category, i < SLOTS.length ? SLOTS[i] : FALLBACK);
  });
  return map;
}
