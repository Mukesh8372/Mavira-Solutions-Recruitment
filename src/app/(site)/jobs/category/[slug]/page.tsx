import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/shared/json-ld";
import { IconChip } from "@/components/shared/icon";
import { breadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { JobCard } from "@/features/jobs/job-card";
import { getDepartmentBySlug, getDepartments, getJobsByDepartment } from "@/features/jobs/queries";

export async function generateStaticParams() {
  const departments = await getDepartments();
  return departments.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const department = await getDepartmentBySlug(slug);
  if (!department) return { title: "Category not found" };
  return {
    title: `${department.name} Jobs — Current Openings`,
    description: `Open ${department.name} roles in BFSI and broking from ${siteConfig.name}' client desks. Free for candidates — apply with your resume in minutes.`,
    alternates: { canonical: `/jobs/category/${department.slug}` },
  };
}

export default async function JobCategoryPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const department = await getDepartmentBySlug(slug);
  if (!department) notFound();

  const [jobs, departments] = await Promise.all([getJobsByDepartment(slug), getDepartments()]);
  const otherDepartments = departments.filter((d) => d.slug !== slug);
  const breadcrumbItems = [
    { label: "Jobs", href: "/jobs" },
    { label: department.name, href: `/jobs/category/${department.slug}` },
  ];

  return (
    <>
      <section className="border-b border-line bg-background-alt">
        <div className="container-site py-10 md:py-14">
          <Breadcrumb items={breadcrumbItems} />
          <div className="flex items-start gap-4">
            <IconChip name={department.icon ?? "briefcase-business"} className="mt-1 hidden sm:grid" />
            <div>
              <h1 className="text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">{department.name} jobs</h1>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-body">
                {jobs.length > 0
                  ? `${jobs.length} open ${department.name} role${jobs.length === 1 ? "" : "s"} from our client desks.`
                  : `No ${department.name} roles are open right now. New roles are added as our clients open positions.`}
              </p>
              <Link
                href={`/jobs?category=${department.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline"
              >
                Filter these openings by location, experience and more
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-site py-10 md:py-14" aria-label={`${department.name} openings`}>
        {jobs.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center shadow-soft">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
              <BriefcaseBusiness className="size-6" aria-hidden />
            </span>
            <h2 className="mt-5 text-xl font-bold">No {department.name} roles open right now</h2>
            <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-body">
              Browse the other categories, or contact our team and tell us what you are looking for.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/jobs" className={buttonVariants({ variant: "primary" })}>
                Browse all openings
              </Link>
              <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
                Contact our team
              </Link>
            </div>
          </div>
        )}
      </section>

      {otherDepartments.length > 0 && (
        <section className="border-t border-line bg-background-alt py-12 md:py-16" aria-labelledby="other-categories-heading">
          <div className="container-site">
            <h2 id="other-categories-heading" className="text-xl font-bold tracking-tight">
              Explore other categories
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {otherDepartments.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/jobs/category/${d.slug}`}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13.5px] font-semibold text-body",
                      "shadow-soft transition-colors hover:border-primary hover:text-primary"
                    )}
                  >
                    {d.name}
                    <span className="text-[12px] tabular-nums text-faint">{d._count.jobs}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
    </>
  );
}
