import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileSearch } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { Icon, IconChip } from "@/components/shared/icon";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getIndustryBySlug, getJobsByIndustry } from "@/features/jobs/queries";
import { JobCard } from "@/features/jobs/job-card";
import { servicesContent } from "@/content/services";

/** Editorial extras per industry — typical role families we place most often. */
const typicalRoles: Record<string, string[]> = {
  "information-technology": ["Software engineers", "Product & design", "DevOps & data"],
  "banking-financial-services": ["Credit & risk", "Relationship managers", "Compliance & ops"],
  healthcare: ["Nursing & clinical", "Lab & diagnostics", "Pharma sales"],
  manufacturing: ["Production & quality", "Plant finance", "Procurement"],
  "retail-ecommerce": ["Store & area managers", "Growth marketing", "Category & merchandising"],
  "logistics-supply-chain": ["Warehouse supervisors", "Fleet & last-mile ops", "Planning & analytics"],
  hospitality: ["Front office & F&B", "Property leadership", "Guest experience"],
  "engineering-infrastructure": ["Project engineers", "Site execution", "Design & planning"],
};

/** Services most relevant to each vertical (falls back to the core trio). */
const relatedServiceSlugs: Record<string, string[]> = {
  "information-technology": ["permanent-hiring", "contract-staffing", "executive-search"],
  "banking-financial-services": ["permanent-hiring", "executive-search", "bulk-hiring"],
  healthcare: ["permanent-hiring", "bulk-hiring", "payroll-services"],
  manufacturing: ["bulk-hiring", "contract-staffing", "executive-search"],
  "retail-ecommerce": ["bulk-hiring", "permanent-hiring", "campus-hiring"],
  "logistics-supply-chain": ["bulk-hiring", "contract-staffing", "payroll-services"],
  hospitality: ["bulk-hiring", "permanent-hiring", "payroll-services"],
  "engineering-infrastructure": ["contract-staffing", "permanent-hiring", "executive-search"],
};

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) return {};
  return {
    title: `${industry.name} Recruitment — Jobs & Hiring`,
    description: `${industry.description ?? `Specialist recruitment for ${industry.name}.`} Domain-specialist recruiters, live openings and 3–5 day shortlists from TalentBridge.`,
    alternates: { canonical: `/industries/${industry.slug}` },
  };
}

export default async function IndustryDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) notFound();

  const jobs = await getJobsByIndustry(industry.slug);
  const cities = new Set(jobs.map((j) => j.location));
  const roles = typicalRoles[industry.slug] ?? ["Individual contributors", "Team leads", "Functional managers"];
  const related = (relatedServiceSlugs[industry.slug] ?? ["permanent-hiring", "contract-staffing", "bulk-hiring"])
    .map((s) => servicesContent.find((svc) => svc.slug === s))
    .filter((s): s is (typeof servicesContent)[number] => Boolean(s));

  const crumbs = [
    { label: "Industries", href: "/industries" },
    { label: industry.name, href: `/industries/${industry.slug}` },
  ];

  const stats = [
    { label: "roles open right now", value: String(jobs.length) },
    { label: "typical roles we place", value: roles.join(" · "), small: true },
    { label: cities.size === 1 ? "city hiring today" : "cities hiring today", value: String(cities.size || "—") },
  ];

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Intro */}
      <section className="container-site pb-14 pt-4 md:pb-16" aria-labelledby="industry-heading">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">
            <Icon name={industry.icon ?? "building"} className="size-4" />
            Industry
          </span>
          <h1 id="industry-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            {industry.name} recruitment, <span className="text-gradient">done by insiders</span>
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-body md:text-lg">
            {industry.description} Our {industry.name.toLowerCase()} desk screens every candidate against the
            realities of the role — not keywords — before a client or a candidate spends a minute on an interview.
          </p>
        </Reveal>

        {/* Stats trio */}
        <Reveal className="mt-10">
          <dl className="grid gap-5 rounded-card border border-line bg-surface p-6 shadow-soft sm:grid-cols-3 md:p-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className={s.small ? "text-[15px] font-bold leading-snug text-foreground" : "text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"}>
                  {s.value}
                </dd>
                <dt className="mt-1 text-[13px] font-medium text-body">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* Current openings */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="Current openings">
        <div className="container-site">
          <SectionHeading
            eyebrow="Live now"
            title={`Current openings in ${industry.name}`}
            lead="Every listing is verified and actively worked by a specialist recruiter — no ghost jobs."
          />
          {jobs.length > 0 ? (
            <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <RevealItem as="li" key={job.id}>
                  <JobCard job={job} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <Reveal>
              <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-dashed border-line bg-surface p-10 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
                  <FileSearch className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-[16px] font-bold text-foreground">No open roles right now</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-body">
                    New {industry.name.toLowerCase()} roles open every week. Upload your resume and we&apos;ll call you
                    the moment one matches.
                  </p>
                </div>
                <Link
                  href="/candidates#upload-resume"
                  className="inline-flex h-11 items-center gap-2 rounded-btn bg-primary px-5 text-[14.5px] font-semibold text-white transition-all hover:bg-primary-strong hover:shadow-glow active:scale-[0.98]"
                >
                  Upload your resume
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Related services */}
      <section className="container-site py-20 md:py-24" aria-label="Recommended services for this industry">
        <SectionHeading
          eyebrow="For employers"
          title={`How we help ${industry.name.toLowerCase()} companies hire`}
          align="left"
          className="mb-8"
        />
        <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3">
          {related.map((s) => (
            <RevealItem as="li" key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft transition-all duration-250 hover:-translate-y-0.5 hover:shadow-card"
              >
                <IconChip name={s.icon} tone="primary" />
                <span className="mt-4 block text-[15.5px] font-bold text-foreground group-hover:text-primary">{s.title}</span>
                <span className="mt-1.5 block flex-1 text-[13.5px] leading-relaxed text-body">{s.short}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-semibold text-primary">
                  Learn more
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <CtaBand
        title={`Hiring ${industry.name.toLowerCase()} talent?`}
        lead="Put a domain-specialist desk on it — screened shortlist in 3–5 business days."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
