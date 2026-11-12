import { AGE_MAX, AGE_MIN, CTC_MAX_LPA, EXPERIENCE_MAX, INDIAN_CITIES, NOTICE_PERIODS, QUALIFICATIONS, parseDateOnly } from "@/features/jobs/options";
import { APPLICATION_STATUSES } from "@/features/jobs/admin-schemas";

/**
 * The /admin/applications filters. Every filter is a query parameter, so a filtered
 * view can be bookmarked or shared. Bad values are dropped, never errors.
 */

export const APPLICATIONS_PER_PAGE = 25;

export const APPLICANT_SORTS = ["newest", "oldest", "experience"] as const;
export type ApplicantSort = (typeof APPLICANT_SORTS)[number];

export type ApplicantFilters = {
  job?: string;
  category?: string;
  status?: (typeof APPLICATION_STATUSES)[number];
  ageMin?: number;
  ageMax?: number;
  expMin?: number;
  expMax?: number;
  ctcMin?: number;
  ctcMax?: number;
  city?: (typeof INDIAN_CITIES)[number];
  qualification?: (typeof QUALIFICATIONS)[number];
  notice?: (typeof NOTICE_PERIODS)[number];
  from?: string; // YYYY-MM-DD, IST
  to?: string; // YYYY-MM-DD, IST
  q?: string;
  sort: ApplicantSort;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined, max = 80): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  const t = s?.trim();
  return t ? t.slice(0, max) : undefined;
}

function int(v: string | undefined, min: number, max: number): number | undefined {
  if (v === undefined || !/^\d+$/.test(v)) return undefined;
  const n = Number(v);
  return n >= min && n <= max ? n : undefined;
}

function lpa(v: string | undefined): number | undefined {
  if (v === undefined || !/^\d{1,4}(\.\d)?$/.test(v)) return undefined;
  const n = Number(v);
  return n <= CTC_MAX_LPA ? n : undefined;
}

function dateOnly(v: string | undefined): string | undefined {
  return v !== undefined && parseDateOnly(v) ? v : undefined;
}

function oneOf<T extends readonly unknown[]>(list: T, v: unknown): T[number] | undefined {
  return (list as readonly unknown[]).includes(v) ? (v as T[number]) : undefined;
}

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export function parseApplicantFilters(sp: SearchParams): ApplicantFilters {
  const job = first(sp.job);
  const category = first(sp.category);
  const notice = int(first(sp.notice), 0, 365);
  const page = int(first(sp.page), 1, 100_000);
  return {
    job: job && ID_RE.test(job) ? job : undefined,
    category: category && ID_RE.test(category) ? category : undefined,
    status: oneOf(APPLICATION_STATUSES, first(sp.status)),
    ageMin: int(first(sp.ageMin), AGE_MIN, AGE_MAX),
    ageMax: int(first(sp.ageMax), AGE_MIN, AGE_MAX),
    expMin: int(first(sp.expMin), 0, EXPERIENCE_MAX),
    expMax: int(first(sp.expMax), 0, EXPERIENCE_MAX),
    ctcMin: lpa(first(sp.ctcMin)),
    ctcMax: lpa(first(sp.ctcMax)),
    city: oneOf(INDIAN_CITIES, first(sp.city)),
    qualification: oneOf(QUALIFICATIONS, first(sp.qualification)),
    notice: notice === undefined ? undefined : oneOf(NOTICE_PERIODS, notice),
    from: dateOnly(first(sp.from)),
    to: dateOnly(first(sp.to)),
    q: first(sp.q),
    sort: oneOf(APPLICANT_SORTS, first(sp.sort)) ?? "newest",
    page: page ?? 1,
  };
}

export function applicantFiltersToParams(f: ApplicantFilters, page = f.page): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: string, v: string | number | undefined) => {
    if (v !== undefined && v !== "") p.set(k, String(v));
  };
  set("job", f.job);
  set("category", f.category);
  set("status", f.status);
  set("ageMin", f.ageMin);
  set("ageMax", f.ageMax);
  set("expMin", f.expMin);
  set("expMax", f.expMax);
  set("ctcMin", f.ctcMin);
  set("ctcMax", f.ctcMax);
  set("city", f.city);
  set("qualification", f.qualification);
  set("notice", f.notice);
  set("from", f.from);
  set("to", f.to);
  set("q", f.q);
  if (f.sort !== "newest") set("sort", f.sort);
  if (page > 1) set("page", page);
  return p;
}

export function applicantsHref(f: ApplicantFilters, page = f.page): string {
  const qs = applicantFiltersToParams(f, page).toString();
  return qs ? `/admin/applications?${qs}` : "/admin/applications";
}

/** How many filters are active, for the "Clear filters" affordance. Sort and page do not count. */
export function activeApplicantFilterCount(f: ApplicantFilters): number {
  const { sort: _sort, page: _page, ...rest } = f;
  void _sort;
  void _page;
  return Object.values(rest).filter((v) => v !== undefined).length;
}
