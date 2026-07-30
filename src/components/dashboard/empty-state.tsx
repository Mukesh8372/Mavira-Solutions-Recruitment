import Link from "next/link";
import { DashboardIcon } from "@/components/shared/dashboard-icon";

export function EmptyState({
  icon = "inbox",
  title,
  body,
  cta,
}: {
  icon?: string;
  title: string;
  body?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-background-alt text-faint">
        <DashboardIcon name={icon} className="size-5" />
      </span>
      <p className="mt-4 text-[15.5px] font-bold text-foreground">{title}</p>
      {body && <p className="mt-1 max-w-sm text-[13.5px] text-body">{body}</p>}
      {cta && (
        <Link
          href={cta.href}
          className="mt-5 inline-flex h-10 items-center rounded-btn bg-primary px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-strong"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
