import { formatMoney } from "@/lib/format";
import type { PlannerDay } from "@/features/itinerary/types";

export function BudgetSummary({ days }: { days: PlannerDay[] }) {
  const itemCount = days.reduce((n, d) => n + d.items.length, 0);
  const total = days.reduce(
    (sum, d) => sum + d.items.reduce((a, i) => a + i.cost, 0),
    0,
  );

  return (
    <div className="rounded-lg border border-border bg-surface-1 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Estimated total</p>
          <p className="font-display text-3xl tabular-nums text-accent-goldText">
            {formatMoney(total)}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>
            {days.length} {days.length === 1 ? "day" : "days"}
          </p>
          <p>
            {itemCount} {itemCount === 1 ? "activity" : "activities"}
          </p>
        </div>
      </div>
    </div>
  );
}
