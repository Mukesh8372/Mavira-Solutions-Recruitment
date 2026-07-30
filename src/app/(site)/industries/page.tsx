import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { Icon } from "@/components/shared/icon";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getIndustries } from "@/features/jobs/queries";

export const metadata: Metadata = {
  title: "Industries We Serve — Domain-Specialist Recruitment",
  description:
    "IT, BFSI, healthcare, manufacturing, retail, logistics, hospitality and infrastructure — recruiters organised by vertical, because every industry hires differently.",
  alternates: { canonical: "/industries" },
};

const crumbs = [{ label: "Industries", href: "/industries" }];

export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Intro */}
      <section className="container-site pb-16 pt-4 md:pb-20" aria-labelledby="industries-heading">
        <Reveal className="max-w-3xl">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Industries</span>
          <h1 id="industries-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            Recruiters who <span className="text-gradient">speak your industry</span>
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-body md:text-lg">
            A great BFSI hire and a great warehouse hire are found in completely different ways — different sourcing
            channels, different screening questions, different red flags. That&apos;s why our recruiters are organised
            by vertical, not by whoever&apos;s free. The person screening your candidates has spent years in your
            domain, knows the compensation bands city by city, and can tell a strong profile from a well-written one.
          </p>
        </Reveal>
      </section>

      {/* Industries grid */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="All industries">
        <div className="container-site">
          <SectionHeading
            eyebrow="Where we place"
            title="Eight verticals, one standard"
            lead="Live open-role counts below — every industry desk runs the same 3–5 day shortlist SLA."
          />
          <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry) => (
              <RevealItem as="li" key={industry.slug}>
                <Link
                  href={`/industries/${industry.slug}`}
                  className="group flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft transition-all duration-250 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Icon name={industry.icon ?? "building"} className="size-5" />
                    </span>
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-semibold text-accent">
                      {industry._count.jobs} open {industry._count.jobs === 1 ? "role" : "roles"}
                    </span>
                  </div>
                  <h2 className="mt-4 text-[16.5px] font-bold group-hover:text-primary">{industry.name}</h2>
                  <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-body">{industry.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-semibold text-primary">
                    View openings
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBand
        title="Hiring in one of these verticals?"
        lead="Get a domain-specialist recruiter on your roles — shortlist in 3–5 days."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
