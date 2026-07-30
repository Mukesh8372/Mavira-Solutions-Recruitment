import type { Metadata } from "next";
import Link from "next/link";
import { FileUp, SearchX } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { JobCard } from "@/features/jobs/job-card";
import { JobSearchForm } from "@/features/jobs/job-search-form";
import { ActiveFilterChips, JobFiltersPanel, JobSortSelect } from "@/features/jobs/job-filters";
import { getDepartments, getJobLocations, JOBS_PER_PAGE, searchJobs, type JobFilters } from "@/features/jobs/queries";
import type { EmploymentType, WorkMode } from "@prisma/client";

export const metadata: Metadata = {
  title: "Current Openings — Jobs across India",
  description:
    "Browse vetted job openings across IT, BFSI, healthcare, manufacturing, retail and logistics. Apply in under two minutes — no fees for candidates, ever.",
  alternates: { canonical: "/jobs" },
};

type SearchParams = Record<string, string | string[] | undefined>;

const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] as const;
const WORK_MODES = ["ONSITE", "REMOTE", "HYBRID"] as const;
const EXPERIENCE_VALUES = ["0-1", "1-3", "3-5", "5-8", "8-99"];
const SALARY_VALUES = [5, 10, 15, 25, 50];

function first(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() ? s.trim() : undefined;
}

function many(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

function parseFilters(sp: SearchParams): JobFilters {
  const salary = Number(first(sp.salary));
  const sortRaw = first(sp.sort);
  const experience = first(sp.experience);
  const page = Number(first(sp.page));
  return {
    q: first(sp.q),
    location: first(sp.location),
    department: first(sp.department),
    experience: experience && EXPERIENCE_VALUES.includes(experience) ? experience : undefined,
    salaryMin: SALARY_VALUES.includes(salary) ? salary : undefined,
    type: many(sp.type).filter((t): t is EmploymentType => (EMPLOYMENT_TYPES as readonly string[]).includes(t)),
    mode: many(sp.mode).filter((m): m is WorkMode => (WORK_MODES as readonly string[]).includes(m)),
    sort: sortRaw === "salary" || sortRaw === "relevance" ? sortRaw : "newest",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** Serialize the active filters back into query params (used for pagination hrefs). */
function filterParams(f: JobFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.location) p.set("location", f.location);
  if (f.department) p.set("department", f.department);
  if (f.experience) p.set("experience", f.experience);
  if (f.salaryMin) p.set("salary", String(f.salaryMin));
  f.type?.forEach((t) => p.append("type", t));
  f.mode?.forEach((m) => p.append("mode", m));
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  return p;
}

export default async function JobsPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const filters = parseFilters(sp);

  const [{ jobs, total, page, totalPages }, departments, locations] = await Promise.all([
    searchJobs(filters),
    getDepartments(),
    getJobLocations(),
  ]);

  const departmentOptions = departments.map((d) => ({ slug: d.slug, name: d.name, count: d._count.jobs }));

  // Params the search bar must carry along (everything except q/location/page).
  const hiddenParams: [string, string][] = [];
  if (filters.department) hiddenParams.push(["department", filters.department]);
  if (filters.experience) hiddenParams.push(["experience", filters.experience]);
  if (filters.salaryMin) hiddenParams.push(["salary", String(filters.salaryMin)]);
  filters.type?.forEach((t) => hiddenParams.push(["type", t]));
  filters.mode?.forEach((m) => hiddenParams.push(["mode", m]));
  if (filters.sort && filters.sort !== "newest") hiddenParams.push(["sort", filters.sort]);

  const hrefFor = (p: number) => {
    const params = filterParams(filters);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  };

  const from = total === 0 ? 0 : (page - 1) * JOBS_PER_PAGE + 1;
  const to = Math.min(page * JOBS_PER_PAGE, total);
  const breadcrumbItems = [{ label: "Jobs", href: "/jobs" }];

  return (
    <>
      {/* Page header + search */}
      <section className="border-b border-line bg-background-alt">
        <div className="container-site py-10 md:py-14">
          <Breadcrumb items={breadcrumbItems} />
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Job board</span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            Current openings <span className="text-faint">({total})</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-body">
            Every role below is verified with the hiring manager and actively interviewing. Applying is free — we never charge
            candidates, at any stage.
          </p>
          <div className="mt-7 max-w-3xl">
            <JobSearchForm q={filters.q} location={filters.location} locations={locations} hiddenParams={hiddenParams} />
          </div>
        </div>
      </section>

      <section className="container-site py-10 md:py-14">
        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <aside aria-label="Job filters" className="lg:sticky lg:top-24">
            <JobFiltersPanel departments={departmentOptions} />
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13.5px] text-faint" aria-live="polite">
                {total === 0 ? "No roles found" : `Showing ${from}–${to} of ${total} role${total === 1 ? "" : "s"}`}
              </p>
              <JobSortSelect />
            </div>

            <ActiveFilterChips departments={departmentOptions} />

            {jobs.length > 0 ? (
              <>
                <ul className="grid grid-cols-1 gap-4">
                  {jobs.map((job) => (
                    <li key={job.id}>
                      <JobCard job={job} />
                    </li>
                  ))}
                </ul>
                <Pagination current={page} total={totalPages} hrefFor={hrefFor} />
              </>
            ) : (
              <div className="rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center shadow-soft">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <SearchX className="size-6" aria-hidden />
                </span>
                <h2 className="mt-5 text-xl font-bold">No roles match those filters</h2>
                <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-body">
                  Try widening the experience band or clearing a filter. New roles go live daily — or drop your resume and we&apos;ll
                  call you when a match opens.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/jobs" className={buttonVariants({ variant: "primary" })}>
                    Clear all filters
                  </Link>
                  <Link href="/candidates#upload-resume" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
                    <FileUp className="size-4" aria-hidden />
                    Upload your resume
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
    </>
  );
}
