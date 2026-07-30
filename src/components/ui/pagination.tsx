import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export function Pagination({ current, total, hrefFor }: { current: number; total: number; hrefFor: (page: number) => string }) {
  if (total <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <PageLink href={current > 1 ? hrefFor(current - 1) : undefined} label="Previous page">
        <ChevronLeft className="size-4" aria-hidden />
      </PageLink>
      {pageWindow(current, total).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-faint" aria-hidden>
            …
          </span>
        ) : (
          <PageLink key={p} href={p !== current ? hrefFor(p) : undefined} label={`Page ${p}`} active={p === current}>
            {p}
          </PageLink>
        )
      )}
      <PageLink href={current < total ? hrefFor(current + 1) : undefined} label="Next page">
        <ChevronRight className="size-4" aria-hidden />
      </PageLink>
    </nav>
  );
}

function PageLink({ href, label, active, children }: { href?: string; label: string; active?: boolean; children: React.ReactNode }) {
  const cls = cn(
    "grid size-10 place-items-center rounded-lg border text-sm font-semibold transition-colors",
    active ? "border-primary bg-primary text-white" : "border-line text-body hover:border-primary hover:text-primary",
    !href && !active && "pointer-events-none opacity-40"
  );
  if (!href) {
    return (
      <span className={cls} aria-current={active ? "page" : undefined} aria-label={label}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={label}>
      {children}
    </Link>
  );
}
