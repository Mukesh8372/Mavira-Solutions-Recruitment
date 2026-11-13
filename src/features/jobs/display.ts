import type { EmploymentType, JobStatus, WorkMode } from "@prisma/client";

/**
 * Job-board helpers shared by server and client code (no `server-only`):
 * filter parsing, URL building, option lists and small display rules.
 */

export const JOBS_PER_PAGE = 10;

export const EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "Fresher (0–1 yrs)", min: 0, max: 1 },
  { value: "1-3", label: "1–3 yrs", min: 1, max: 3 },
  { value: "3-5", label: "3–5 yrs", min: 3, max: 5 },
  { value: "5-8", label: "5–8 yrs", min: 5, max: 8 },
  { value: "8-99", label: "8+ yrs", min: 8, max: 99 },
] as const;

export const TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
] as const satisfies readonly { value: EmploymentType; label: string }[];

export const MODE_OPTIONS = [
  { value: "ONSITE", label: "On-site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
] as const satisfies readonly { value: WorkMode; label: string }[];

export type JobSort = "newest" | "salary";

export type JobFilters = {
  q?: string;
  location?: string;
  category?: string; // Department slug
  industry?: string; // Industry slug
  experience?: (typeof EXPERIENCE_OPTIONS)[number]["value"];
  type: EmploymentType[];
  mode: WorkMode[];
  sort: JobSort;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined, max = 80): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  const t = s?.trim();
  return t ? t.slice(0, max) : undefined;
}

function many(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

const SLUG_RE = /^[a-z0-9-]{1,60}$/;

/** Reads the /jobs query string. Unknown or malformed values are dropped, never errors. */
export function parseJobFilters(sp: SearchParams): JobFilters {
  const experience = first(sp.experience);
  const sort = first(sp.sort);
  const page = Number(first(sp.page));
  const category = first(sp.category);
  const industry = first(sp.industry);
  return {
    q: first(sp.q),
    location: first(sp.location, 60),
    category: category && SLUG_RE.test(category) ? category : undefined,
    industry: industry && SLUG_RE.test(industry) ? industry : undefined,
    experience: EXPERIENCE_OPTIONS.find((o) => o.value === experience)?.value,
    type: many(sp.type).filter((t): t is EmploymentType => TYPE_OPTIONS.some((o) => o.value === t)),
    mode: many(sp.mode).filter((m): m is WorkMode => MODE_OPTIONS.some((o) => o.value === m)),
    sort: sort === "salary" ? "salary" : "newest",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** Serialises filters back into query params. `page` is only written when above 1. */
export function jobFiltersToParams(f: JobFilters, page = f.page): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.location) p.set("location", f.location);
  if (f.category) p.set("category", f.category);
  if (f.industry) p.set("industry", f.industry);
  if (f.experience) p.set("experience", f.experience);
  f.type.forEach((t) => p.append("type", t));
  f.mode.forEach((m) => p.append("mode", m));
  if (f.sort !== "newest") p.set("sort", f.sort);
  if (page > 1) p.set("page", String(page));
  return p;
}

export function jobsHref(f: JobFilters, page = f.page): string {
  const qs = jobFiltersToParams(f, page).toString();
  return qs ? `/jobs?${qs}` : "/jobs";
}

/** A job accepts applications while PUBLISHED and before its apply-by date. */
export function isJobOpen(job: { status: JobStatus; validThrough: Date | null }, now = new Date()): boolean {
  return job.status === "PUBLISHED" && (job.validThrough === null || job.validThrough.getTime() > now.getTime());
}


