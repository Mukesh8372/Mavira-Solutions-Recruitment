"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type TestimonialCardItem = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  company: string | null;
  rating: number;
  kind: string;
};

const tabs = [
  { value: "ALL", label: "All" },
  { value: "CLIENT", label: "Employers" },
  { value: "CANDIDATE", label: "Candidates" },
] as const;

type Tab = (typeof tabs)[number]["value"];

export function TestimonialFilter({ items }: { items: TestimonialCardItem[] }) {
  const [tab, setTab] = useState<Tab>("ALL");
  const visible = tab === "ALL" ? items : items.filter((t) => t.kind === tab);

  return (
    <div>
      <div role="tablist" aria-label="Filter testimonials" className="mb-10 flex justify-center gap-2">
        {tabs.map((t) => {
          const count = t.value === "ALL" ? items.length : items.filter((i) => i.kind === t.value).length;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors",
                tab === t.value
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-surface text-body hover:border-primary hover:text-primary"
              )}
            >
              {t.label} <span className={cn("ml-0.5", tab === t.value ? "text-white/70" : "text-faint")}>{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((t) => (
          <li key={t.id}>
            <figure className="flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 text-warning" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" aria-hidden />
                  ))}
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
                    t.kind === "CLIENT" ? "bg-secondary-soft text-secondary" : "bg-accent-soft text-accent"
                  )}
                >
                  {t.kind === "CLIENT" ? "Employer" : "Candidate"}
                </span>
              </div>
              <blockquote className="mt-4 flex-1">
                <p className="text-[14.5px] leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <Avatar name={t.authorName} />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-foreground">{t.authorName}</p>
                  <p className="truncate text-[12.5px] text-faint">
                    {t.authorRole}
                    {t.company ? ` · ${t.company}` : ""}
                  </p>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
