import { DashboardIcon } from "@/components/shared/dashboard-icon";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: "primary" | "secondary" | "accent" | "warning";
  hint?: string;
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    secondary: "bg-secondary-soft text-secondary",
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning/12 text-warning",
  } as const;
  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-body">{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-lg", tones[tone])}>
          <DashboardIcon name={icon} className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-[28px] font-extrabold tracking-tight text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[12.5px] text-faint">{hint}</p>}
    </div>
  );
}
