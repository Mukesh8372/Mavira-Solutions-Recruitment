import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JobCard } from "@/features/jobs/job-card";
import { JobSearchForm } from "@/features/jobs/job-search-form";
import { ActiveFilterChips, JobFiltersPanel, JobSortSelect } from "@/features/jobs/job-filters";
import { JOBS_PER_PAGE, jobFiltersToParams, jobsHref, parseJobFilters } from "@/features/jobs/display";
import { getDepartments, getJobLocations, searchJobs } from "@/features/jobs/queries";
import { getIndustries } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Current Openings — BFSI & Broking Jobs",
  description:
    "Open roles in banking, insurance, wealth management, stock broking, NBFC and FinTech from Mavira Solutions' client desks. Apply with your resume in minutes. Free for candidates.",
  alternates: { canonical: "/jobs" },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function JobsPage(props: { searchParams: Promise<SearchParams> }) {
  const filters = parseJobFilters(await props.searchParams);

  const [{ jobs, total, page, totalPages }, departments, industries, locations] = await Promise.all([
    searchJobs(filters),
    getDepartments(),
    getIndustries(),
    getJobLocations(),
  ]);

  const categoryOptions = departments.map((d) => ({ slug: d.slug, name: d.name, count: d._count.jobs }));
  const industryOptions = industries.map((i) => ({ slug: i.slug, name: i.name }));

  // Params the search bar must carry along (everything except q, location and page).
  const hiddenParams = [...jobFiltersToParams({ ...filters, q: undefined, location: undefined }, 1).entries()];

  const from = total === 0 ? 0 : (page - 1) * JOBS_PER_PAGE + 1;
  const to = Math.min(page * JOBS_PER_PAGE, total);
  const breadcrumbItems = [{ label: "Jobs", href: "/jobs" }];

  return (
    <>
      <section className="border-b border-line bg-background-alt">
        <div className="container-site py-10 md:py-14">
          <Breadcrumb items={breadcrumbItems} />
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Job board</span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            Current openings <span className="text-faint">({total})</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-body">
            Roles our client desks are hiring for across BFSI and broking. Applying is free — we never charge candidates at any
            stage.
          </p>
          <div className="mt-7 max-w-3xl">
            <JobSearchForm q={filters.q} location={filters.location} locations={locations} hiddenParams={hiddenParams} />
          </div>
        </div>
      </section>

      <section className="container-site py-10 md:py-14">
        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <aside aria-label="Job filters" className="lg:sticky lg:top-24">
            <JobFiltersPanel categories={categoryOptions} industries={industryOptions} />
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13.5px] text-faint" aria-live="polite">
                {total === 0 ? "No roles found" : `Showing ${from}–${to} of ${total} role${total === 1 ? "" : "s"}`}
              </p>
              <JobSortSelect />
            </div>

            <ActiveFilterChips categories={categoryOptions} industries={industryOptions} />

            {jobs.length > 0 ? (
              <>
                <ul className="grid grid-cols-1 gap-4">
                  {jobs.map((job) => (
                    <li key={job.id}>
                      <JobCard job={job} />
                    </li>
                  ))}
                </ul>
                <Pagination current={page} total={totalPages} hrefFor={(p) => jobsHref(filters, p)} />
              </>
            ) : (
              <div className="rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center shadow-soft">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <SearchX className="size-6" aria-hidden />
                </span>
                <h2 className="mt-5 text-xl font-bold">No roles match those filters</h2>
                <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-body">
                  Try widening the experience band or clearing a filter. New roles are added as our clients open positions.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/jobs" className={buttonVariants({ variant: "primary" })}>
                    Clear all filters
                  </Link>
                  <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
                    Contact our team
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
