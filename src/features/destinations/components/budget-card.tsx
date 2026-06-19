import { formatMoney } from "@/lib/format";
import type { DestinationBudget } from "@/types";

const ROWS: { key: keyof DestinationBudget; label: string }[] = [
  { key: "accommodation", label: "Accommodation" },
  { key: "food", label: "Food & drink" },
  { key: "transport", label: "Local transport" },
];

export function BudgetCard({ budget }: { budget: DestinationBudget }) {
  const total = budget.accommodation + budget.food + budget.transport;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <dl className="divide-y divide-border">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between py-3 first:pt-0"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium tabular-nums">
              {formatMoney(budget[row.key])}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between pt-4">
          <dt className="font-display text-lg">Per day</dt>
          <dd className="font-display text-lg tabular-nums text-accent-goldText">
            {formatMoney(total)}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">
        Estimated per person, per day (mid-range). Excludes flights.
      </p>
    </div>
  );
}
