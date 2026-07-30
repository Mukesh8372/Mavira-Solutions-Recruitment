import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterTab = { label: string; href: string; active: boolean };

/** Server-rendered pill tabs for searchParams-driven list filters. */
export function FilterTabs({ tabs, label }: { tabs: FilterTab[]; label: string }) {
  return (
    <nav aria-label={label} className="mb-4 flex flex-wrap items-center gap-1.5">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
            tab.active
              ? "border-primary/40 bg-primary-soft text-primary"
              : "border-line bg-surface text-body hover:border-faint hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
