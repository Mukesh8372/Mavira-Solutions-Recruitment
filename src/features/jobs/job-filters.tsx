"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EXPERIENCE_OPTIONS, MODE_OPTIONS, TYPE_OPTIONS } from "@/features/jobs/display";

export type CategoryOption = { slug: string; name: string; count: number };
export type IndustryOption = { slug: string; name: string };

/** Push a mutated copy of the current search params to /jobs, resetting pagination. */
function useApplyParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  return React.useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(searchParams.toString());
      p.delete("page");
      mutate(p);
      const qs = p.toString();
      router.push(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
    },
    [router, searchParams]
  );
}

function activeFilterCount(p: URLSearchParams): number {
  return (
    (p.get("category") ? 1 : 0) +
    (p.get("industry") ? 1 : 0) +
    (p.get("experience") ? 1 : 0) +
    p.getAll("type").length +
    p.getAll("mode").length
  );
}

/** "Clear all" target: drops every filter but keeps the search-bar terms. */
function clearFiltersHref(p: URLSearchParams): string {
  const next = new URLSearchParams();
  const q = p.get("q");
  const location = p.get("location");
  if (q) next.set("q", q);
  if (location) next.set("location", location);
  const qs = next.toString();
  return qs ? `/jobs?${qs}` : "/jobs";
}

function FilterRadio({
  id,
  name,
  label,
  count,
  checked,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[13.5px] text-body transition-colors hover:bg-background-alt has-checked:font-semibold has-checked:text-primary"
    >
      <span className="flex min-w-0 items-center gap-2">
        <input type="radio" id={id} name={name} checked={checked} onChange={onChange} className="size-3.5 shrink-0 accent-(--color-primary)" />
        <span className="truncate">{label}</span>
      </span>
      {typeof count === "number" && <span className="shrink-0 text-[12px] tabular-nums text-faint">{count}</span>}
    </label>
  );
}

function FilterCheckbox({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13.5px] text-body transition-colors hover:bg-background-alt has-checked:font-semibold has-checked:text-primary"
    >
      <input type="checkbox" id={id} checked={checked} onChange={onChange} className="size-3.5 shrink-0 rounded accent-(--color-primary)" />
      {label}
    </label>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-[12.5px] font-semibold uppercase tracking-[0.06em] text-faint">{legend}</legend>
      <div className="flex flex-col gap-0.5">{children}</div>
    </fieldset>
  );
}

/** The filter controls; rendered once in the desktop sidebar and once in the mobile sheet. */
function FilterControls({ categories, industries, idPrefix }: { categories: CategoryOption[]; industries: IndustryOption[]; idPrefix: string }) {
  const searchParams = useSearchParams();
  const apply = useApplyParams();

  const setSingle = (name: string, value: string) =>
    apply((p) => {
      if (value) p.set(name, value);
      else p.delete(name);
    });

  const toggleMulti = (name: string, value: string) =>
    apply((p) => {
      const values = p.getAll(name);
      p.delete(name);
      const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
      next.forEach((v) => p.append(name, v));
    });

  const category = searchParams.get("category") ?? "";
  const industry = searchParams.get("industry") ?? "";
  const experience = searchParams.get("experience") ?? "";
  const types = searchParams.getAll("type");
  const modes = searchParams.getAll("mode");

  return (
    <div className="flex flex-col gap-5">
      <FilterGroup legend="Role category">
        <FilterRadio id={`${idPrefix}-cat-all`} name={`${idPrefix}-category`} label="All categories" checked={!category} onChange={() => setSingle("category", "")} />
        {categories.map((c) => (
          <FilterRadio
            key={c.slug}
            id={`${idPrefix}-cat-${c.slug}`}
            name={`${idPrefix}-category`}
            label={c.name}
            count={c.count}
            checked={category === c.slug}
            onChange={() => setSingle("category", c.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Industry">
        <FilterRadio id={`${idPrefix}-ind-all`} name={`${idPrefix}-industry`} label="All industries" checked={!industry} onChange={() => setSingle("industry", "")} />
        {industries.map((i) => (
          <FilterRadio
            key={i.slug}
            id={`${idPrefix}-ind-${i.slug}`}
            name={`${idPrefix}-industry`}
            label={i.name}
            checked={industry === i.slug}
            onChange={() => setSingle("industry", i.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Experience">
        <FilterRadio id={`${idPrefix}-exp-any`} name={`${idPrefix}-experience`} label="Any experience" checked={!experience} onChange={() => setSingle("experience", "")} />
        {EXPERIENCE_OPTIONS.map((o) => (
          <FilterRadio
            key={o.value}
            id={`${idPrefix}-exp-${o.value}`}
            name={`${idPrefix}-experience`}
            label={o.label}
            checked={experience === o.value}
            onChange={() => setSingle("experience", o.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Employment type">
        {TYPE_OPTIONS.map((o) => (
          <FilterCheckbox key={o.value} id={`${idPrefix}-type-${o.value}`} label={o.label} checked={types.includes(o.value)} onChange={() => toggleMulti("type", o.value)} />
        ))}
      </FilterGroup>

      <FilterGroup legend="Work mode">
        {MODE_OPTIONS.map((o) => (
          <FilterCheckbox key={o.value} id={`${idPrefix}-mode-${o.value}`} label={o.label} checked={modes.includes(o.value)} onChange={() => toggleMulti("mode", o.value)} />
        ))}
      </FilterGroup>
    </div>
  );
}

/** Desktop filter sidebar + mobile bottom sheet, sharing one set of controls. */
export function JobFiltersPanel({ categories, industries }: { categories: CategoryOption[]; industries: IndustryOption[] }) {
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const count = activeFilterCount(new URLSearchParams(searchParams.toString()));
  const clearHref = clearFiltersHref(new URLSearchParams(searchParams.toString()));

  // Close the sheet on Escape and lock body scroll while it is open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div className="hidden rounded-card border border-line bg-surface p-5 shadow-soft lg:block">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-foreground">Filters</h2>
          {count > 0 && (
            <Link href={clearHref} className="text-[13px] font-semibold text-primary hover:underline">
              Clear all
            </Link>
          )}
        </div>
        <FilterControls categories={categories} industries={industries} idPrefix="desktop" />
      </div>

      <Button type="button" variant="secondary" className="w-full lg:hidden" onClick={() => setOpen(true)} aria-expanded={open}>
        <SlidersHorizontal aria-hidden />
        Filters{count > 0 ? ` (${count})` : ""}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Job filters"
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-modal border-t border-line bg-surface shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-[15px] font-bold text-foreground">Filters{count > 0 ? ` (${count})` : ""}</h2>
              <div className="flex items-center gap-4">
                {count > 0 && (
                  <Link href={clearHref} className="text-[13px] font-semibold text-primary hover:underline" onClick={() => setOpen(false)}>
                    Clear all
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-primary hover:text-primary"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-5 py-5">
              <FilterControls categories={categories} industries={industries} idPrefix="mobile" />
            </div>
            <div className="border-t border-line px-5 py-4">
              <Button type="button" className="w-full" onClick={() => setOpen(false)}>
                Show results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Row of removable chips for every active search/filter param. */
export function ActiveFilterChips({ categories, industries }: { categories: CategoryOption[]; industries: IndustryOption[] }) {
  const searchParams = useSearchParams();
  const apply = useApplyParams();

  const chips: { key: string; label: string; remove: (p: URLSearchParams) => void }[] = [];
  const q = searchParams.get("q");
  const location = searchParams.get("location");
  const category = searchParams.get("category");
  const industry = searchParams.get("industry");
  const experience = searchParams.get("experience");

  if (q) chips.push({ key: "q", label: `“${q}”`, remove: (p) => p.delete("q") });
  if (location) chips.push({ key: "location", label: location, remove: (p) => p.delete("location") });
  if (category) {
    const name = categories.find((c) => c.slug === category)?.name ?? category;
    chips.push({ key: "category", label: name, remove: (p) => p.delete("category") });
  }
  if (industry) {
    const name = industries.find((i) => i.slug === industry)?.name ?? industry;
    chips.push({ key: "industry", label: name, remove: (p) => p.delete("industry") });
  }
  if (experience) {
    const label = EXPERIENCE_OPTIONS.find((o) => o.value === experience)?.label ?? experience;
    chips.push({ key: "experience", label, remove: (p) => p.delete("experience") });
  }
  const removeFrom = (name: string, value: string) => (p: URLSearchParams) => {
    const values = p.getAll(name).filter((v) => v !== value);
    p.delete(name);
    values.forEach((v) => p.append(name, v));
  };
  for (const t of searchParams.getAll("type")) {
    chips.push({ key: `type-${t}`, label: TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t, remove: removeFrom("type", t) });
  }
  for (const m of searchParams.getAll("mode")) {
    chips.push({ key: `mode-${m}`, label: MODE_OPTIONS.find((o) => o.value === m)?.label ?? m, remove: removeFrom("mode", m) });
  }

  if (chips.length === 0) return null;

  return (
    <ul className="mb-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() => apply(chip.remove)}
            aria-label={`Remove filter: ${chip.label}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-soft px-3 py-1.5",
              "text-[13px] font-semibold text-primary transition-colors hover:border-primary/50"
            )}
          >
            {chip.label}
            <X className="size-3.5" aria-hidden />
          </button>
        </li>
      ))}
      <li>
        <Link href="/jobs" className="px-1 text-[13px] font-semibold text-faint transition-colors hover:text-primary">
          Clear all
        </Link>
      </li>
    </ul>
  );
}

/** Sort dropdown next to the results count. */
export function JobSortSelect() {
  const searchParams = useSearchParams();
  const apply = useApplyParams();
  const sort = searchParams.get("sort") === "salary" ? "salary" : "newest";

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="job-sort" className="shrink-0 text-[13px] font-semibold text-faint">
        Sort by
      </label>
      <Select
        id="job-sort"
        value={sort}
        onChange={(e) =>
          apply((p) => {
            if (e.target.value === "newest") p.delete("sort");
            else p.set("sort", e.target.value);
          })
        }
        className="h-10 w-40 text-[14px]"
      >
        <option value="newest">Newest</option>
        <option value="salary">Highest salary</option>
      </Select>
    </div>
  );
}
