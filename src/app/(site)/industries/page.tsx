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
import { getIndustries } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Industries We Serve — BFSI, Broking & FinTech Recruitment",
  description:
    "Banking & financial services, insurance & wealth management, stock broking & equity, NBFC & FinTech — specialist recruiters for high-growth financial sectors.",
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
            Mavira Solutions specializes in placing top talent across high-growth financial sectors. A wealth RM, an
            equity dealer and a compliance officer are found in completely different ways — which is why our
            recruiters are organised by vertical. The person screening your candidates knows the products, the
            certifications and the targets the role carries, and can tell a strong profile from a well-written one.
          </p>
        </Reveal>
      </section>

      {/* Industries grid */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="All industries">
        <div className="container-site">
          <SectionHeading
            eyebrow="Where we place"
            title="Sectors we serve"
            lead="Deep industry knowledge in every desk — precise candidate matching for every role."
          />
          <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry) => (
              <RevealItem as="li" key={industry.slug}>
                <Link
                  href={`/industries/${industry.slug}`}
                  className="group flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft transition-all duration-250 hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={industry.icon ?? "building"} className="size-5" />
                  </span>
                  <h2 className="mt-4 text-[16.5px] font-bold group-hover:text-primary">{industry.name}</h2>
                  <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-body">{industry.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-semibold text-primary">
                    Key roles we place
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBand
        title="Hiring in one of these sectors?"
        lead="Get a domain-specialist recruiter on your roles — quality shortlists, quick turnaround."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
