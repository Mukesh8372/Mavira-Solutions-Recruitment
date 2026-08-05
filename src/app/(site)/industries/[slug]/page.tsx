import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { Icon, IconChip } from "@/components/shared/icon";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getIndustryBySlug } from "@/features/content/queries";
import { servicesContent } from "@/content/services";

/** Key positions we place per sector — from the Mavira Solutions company profile. */
const keyRoles: Record<string, string[]> = {
  "banking-financial-services": ["Relationship Manager", "Sales & Branch Manager", "Operations Executive", "Compliance Officer", "Team Leader"],
  "insurance-wealth-management": ["Wealth Manager", "Relationship Manager", "Sales Manager", "Operations Executive", "Compliance Officer"],
  "stock-broking-equity": ["Equity Dealer", "Relationship Manager", "Branch Manager", "Research Analyst"],
  "nbfc-fintech": ["Relationship Manager", "Sales & Branch Manager", "Operations Executive", "Team Leader", "Compliance Officer"],
};

const defaultRoles = ["Relationship Manager", "Sales & Branch Manager", "Operations Executive", "Compliance Officer", "Team Leader"];

/** Services most relevant to each sector. */
const relatedServiceSlugs: Record<string, string[]> = {
  "banking-financial-services": ["bfsi-recruitment", "permanent-recruitment", "bulk-hiring"],
  "insurance-wealth-management": ["bfsi-recruitment", "permanent-recruitment", "executive-search"],
  "stock-broking-equity": ["broking-recruitment", "permanent-recruitment", "bulk-hiring"],
  "nbfc-fintech": ["bfsi-recruitment", "executive-search", "bulk-hiring"],
};

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) return {};
  return {
    title: `${industry.name} Recruitment`,
    description: `${industry.description ?? `Specialist recruitment for ${industry.name}.`} Domain-specialist recruiters and precise candidate matching from Mavira Solutions.`,
    alternates: { canonical: `/industries/${industry.slug}` },
  };
}

export default async function IndustryDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) notFound();

  const roles = keyRoles[industry.slug] ?? defaultRoles;
  const related = (relatedServiceSlugs[industry.slug] ?? ["permanent-recruitment", "executive-search", "bulk-hiring"])
    .map((s) => servicesContent.find((svc) => svc.slug === s))
    .filter((s): s is (typeof servicesContent)[number] => Boolean(s));

  const crumbs = [
    { label: "Industries", href: "/industries" },
    { label: industry.name, href: `/industries/${industry.slug}` },
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
            {industry.description} Our deep industry knowledge ensures precise candidate matching for every role —
            screened against the realities of the job, not keywords.
          </p>
        </Reveal>
      </section>

      {/* Key roles */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="Key positions we place">
        <div className="container-site">
          <SectionHeading
            eyebrow="Key positions"
            title={`Roles we place in ${industry.name}`}
            lead="From front-line to leadership — every profile is vetted by a recruiter who knows the sector."
          />
          <RevealGroup as="ul" className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            {roles.map((role) => (
              <RevealItem
                as="li"
                key={role}
                className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-soft"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <Check className="size-4" aria-hidden />
                </span>
                <span className="text-[14.5px] font-semibold text-foreground">{role}</span>
              </RevealItem>
            ))}
          </RevealGroup>
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
        lead="Put a domain-specialist desk on it — thoroughly vetted candidates, quick turnaround."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
