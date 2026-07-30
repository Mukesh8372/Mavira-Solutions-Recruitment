import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import {
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Gift,
  Laptop,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { jsonArray, cn } from "@/lib/utils";
import { breadcrumbJsonLd, jobPostingJsonLd } from "@/lib/seo";
import {
  formatDate,
  formatExperience,
  formatRelativeDate,
  formatSalaryRange,
  labelEmploymentType,
  labelWorkMode,
} from "@/lib/format";
import { siteConfig } from "@/config/site";
import { getContactContent } from "@/features/site-content/queries";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/shared/json-ld";
import { getJobBySlug, getRelatedJobs } from "@/features/jobs/queries";
import { JobCard } from "@/features/jobs/job-card";
import { JobCardActions } from "@/features/jobs/job-card-actions";
import { ApplyForm } from "@/features/jobs/apply-form";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const job = await getJobBySlug(slug);
  if (!job || job.status === "DRAFT") return { title: "Job not found" };
  return {
    title: job.seoTitle ?? `${job.title} — ${job.location} | Jobs`,
    description: job.seoDescription ?? job.description.replace(/\s+/g, " ").slice(0, 158),
    alternates: { canonical: `/jobs/${job.slug}` },
  };
}

function ChecklistSection({
  id,
  title,
  items,
  icon: IconComp,
  tone,
}: {
  id: string;
  title: string;
  items: string[];
  icon: typeof CheckCircle2;
  tone: string;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-xl font-bold tracking-tight">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-body">
            <IconComp className={cn("mt-1 size-4 shrink-0", tone)} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function MetaRow({ icon: IconComp, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="flex items-center gap-2 text-[13.5px] text-faint">
        <IconComp className="size-4" aria-hidden />
        {label}
      </dt>
      <dd className="text-right text-[13.5px] font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export default async function JobDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const job = await getJobBySlug(slug);
  const contact = await getContactContent();
  if (!job || job.status === "DRAFT") notFound();

  const closed = job.status !== "PUBLISHED";
  const related = await getRelatedJobs(job);

  if (!closed) {
    // Fire-and-forget view counter — never blocks or breaks the render.
    after(async () => {
      try {
        await prisma.job.update({ where: { id: job.id }, data: { viewCount: { increment: 1 } } });
      } catch {
        /* analytics only — safe to drop */
      }
    });
  }

  const salary = job.salaryVisible ? formatSalaryRange(job.salaryMin, job.salaryMax) : null;
  const responsibilities = jsonArray(job.responsibilities);
  const requirements = jsonArray(job.requirements);
  const skills = jsonArray(job.skills);
  const benefits = jsonArray(job.benefits);
  const paragraphs = job.description.split(/\n\n+/).filter(Boolean);
  const breadcrumbItems = [
    { label: "Jobs", href: "/jobs" },
    { label: job.title, href: `/jobs/${job.slug}` },
  ];

  return (
    <div className={cn(!closed && "pb-20 lg:pb-0")}>
      <div className="container-site py-10 md:py-14">
        <Breadcrumb items={breadcrumbItems} />

        {closed && (
          <div role="status" className="mb-8 flex items-start gap-3 rounded-card border border-warning/40 bg-warning/10 p-5">
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <div>
              <p className="text-[15px] font-bold text-foreground">This role is no longer accepting applications</p>
              <p className="mt-1 text-[14px] leading-relaxed text-body">
                The position has been filled or closed by the employer. Similar openings below are still live — or{" "}
                <Link href="/candidates#upload-resume" className="font-semibold text-primary hover:underline">
                  drop your resume
                </Link>{" "}
                and we&apos;ll match you to the next one.
              </p>
            </div>
          </div>
        )}

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main column */}
          <div className="min-w-0">
            <header>
              <h1 className="text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">{job.title}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[14.5px] text-body">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4 text-faint" aria-hidden />
                  {job.company.name}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-faint" aria-hidden />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-faint" aria-hidden />
                  Posted {formatRelativeDate(job.publishedAt ?? job.createdAt)}
                </span>
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge variant="blue">{labelEmploymentType(job.employmentType)}</Badge>
                <Badge variant="purple">{labelWorkMode(job.workMode)}</Badge>
                <Badge variant="green">{formatExperience(job.experienceMin, job.experienceMax)}</Badge>
                {job.urgent && <Badge variant="red">Urgent</Badge>}
              </div>
            </header>

            <div className="mt-8 flex flex-col gap-10">
              <section aria-labelledby="job-about">
                <h2 id="job-about" className="text-xl font-bold tracking-tight">
                  About the role
                </h2>
                <div className="mt-4 space-y-4">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-[15px] leading-relaxed text-body">
                      {p}
                    </p>
                  ))}
                </div>
              </section>

              <ChecklistSection
                id="job-responsibilities"
                title="What you'll do"
                items={responsibilities}
                icon={CheckCircle2}
                tone="text-accent"
              />
              <ChecklistSection
                id="job-requirements"
                title="What we're looking for"
                items={requirements}
                icon={ClipboardList}
                tone="text-primary"
              />

              {skills.length > 0 && (
                <section aria-labelledby="job-skills">
                  <h2 id="job-skills" className="text-xl font-bold tracking-tight">
                    Skills
                  </h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <li key={skill}>
                        <Badge variant="neutral">{skill}</Badge>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <ChecklistSection id="job-benefits" title="Benefits & perks" items={benefits} icon={Gift} tone="text-secondary" />

              {job.company.about && (
                <Card className="bg-background-alt">
                  <h2 className="flex items-center gap-2 text-[16px] font-bold">
                    <Building2 className="size-4.5 text-primary" aria-hidden />
                    About {job.company.name}
                  </h2>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-body">{job.company.about}</p>
                  <p className="mt-3 text-[13px] text-faint">
                    {[job.company.industry, job.company.size ? `${job.company.size} employees` : null].filter(Boolean).join(" · ")}
                  </p>
                </Card>
              )}

              {!closed && (
                <section id="apply" aria-labelledby="apply-heading" className="scroll-mt-24 rounded-card border border-line bg-surface p-6 shadow-card md:p-8">
                  <h2 id="apply-heading" className="text-2xl font-bold tracking-tight">
                    Apply for this role
                  </h2>
                  <p className="mt-1.5 mb-6 text-[14.5px] text-body">
                    Takes under two minutes. Our team screens every application within 2 business days.
                  </p>
                  <ApplyForm jobId={job.id} jobTitle={job.title} />
                </section>
              )}
            </div>
          </div>

          {/* Sticky aside */}
          <aside className="lg:sticky lg:top-24" aria-label="Role summary and actions">
            <Card className="p-6">
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-faint">Salary</p>
              <p className="mt-1 font-mono text-2xl font-bold text-accent" style={{ fontVariantNumeric: "tabular-nums" }}>
                {salary ?? "On request"}
              </p>

              <dl className="mt-4 divide-y divide-line border-t border-line">
                <MetaRow icon={Briefcase} label="Experience" value={formatExperience(job.experienceMin, job.experienceMax)} />
                <MetaRow icon={ClipboardList} label="Department" value={job.department.name} />
                <MetaRow icon={Laptop} label="Work mode" value={labelWorkMode(job.workMode)} />
                <MetaRow icon={Sparkles} label="Type" value={labelEmploymentType(job.employmentType)} />
                <MetaRow icon={MapPin} label="Location" value={job.location} />
                {job.validThrough && <MetaRow icon={CalendarClock} label="Apply by" value={formatDate(job.validThrough, { day: "numeric", month: "short", year: "numeric" })} />}
              </dl>

              <div className="mt-5 flex items-center gap-3">
                {closed ? (
                  <span className={cn(buttonVariants({ size: "lg" }), "pointer-events-none flex-1 opacity-55")} aria-disabled="true">
                    Applications closed
                  </span>
                ) : (
                  <a href="#apply" className={cn(buttonVariants({ size: "lg" }), "flex-1")}>
                    Apply now
                  </a>
                )}
                <JobCardActions jobId={job.id} slug={job.slug} title={job.title} />
              </div>
            </Card>

            <Card className="mt-5 p-6">
              <h2 className="text-[15px] font-bold">Talk to a recruiter</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-body">
                Questions about the role, salary band or process? Our placement desk answers within a business day.
              </p>
              <ul className="mt-4 space-y-2.5 text-[13.5px] font-semibold">
                <li>
                  <a href={contact.phoneHref} className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary">
                    <Phone className="size-4 text-primary" aria-hidden />
                    {contact.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary">
                    <Mail className="size-4 text-primary" aria-hidden />
                    {contact.email}
                  </a>
                </li>
                <li>
                  <a
                    href={contact.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-accent" aria-hidden>
                      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21h.01c5.45 0 9.89-4.44 9.89-9.9a9.83 9.83 0 0 0-2.9-7A9.83 9.83 0 0 0 12.04 2Zm5.82 14.12c-.25.7-1.45 1.33-2.02 1.42-.52.08-1.17.11-1.88-.12-.44-.14-1-.32-1.71-.63-3-1.3-4.97-4.32-5.12-4.52-.15-.2-1.22-1.63-1.22-3.1 0-1.48.77-2.2 1.05-2.5.27-.3.6-.38.8-.38l.57.01c.19.01.44-.07.68.52.25.6.85 2.07.92 2.22.08.15.13.33.03.53-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.77 1.26 1.65 2.05 1.13 1 2.08 1.32 2.38 1.47.3.15.47.12.65-.08.17-.2.74-.87.94-1.17.2-.3.4-.25.68-.15.27.1 1.75.82 2.04.97.3.15.5.22.57.35.08.13.08.72-.17 1.42Z" />
                    </svg>
                    WhatsApp us
                  </a>
                </li>
              </ul>
            </Card>
          </aside>
        </div>
      </div>

      {/* Related roles */}
      {related.length > 0 && (
        <section className="border-t border-line bg-background-alt py-14 md:py-20" aria-labelledby="related-heading">
          <div className="container-site">
            <h2 id="related-heading" className="text-2xl font-bold tracking-tight">
              Similar roles in {job.department.name}
            </h2>
            <ul className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {related.map((r) => (
                <li key={r.id}>
                  <JobCard job={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Mobile sticky apply bar */}
      {!closed && (
        <div className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line backdrop-blur lg:hidden">
          <div className="container-site flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-foreground">{job.title}</p>
              <p className="font-mono text-[14px] font-bold text-accent" style={{ fontVariantNumeric: "tabular-nums" }}>
                {salary ?? "Salary on request"}
              </p>
            </div>
            <a href="#apply" className={cn(buttonVariants({ size: "md" }), "shrink-0")}>
              Apply now
            </a>
          </div>
        </div>
      )}

      <JsonLd data={jobPostingJsonLd(job)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
    </div>
  );
}
