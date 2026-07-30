import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Check, UserRound } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { IconChip } from "@/components/shared/icon";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { servicesContent } from "@/content/services";

export const metadata: Metadata = {
  title: "Recruitment & Staffing Services",
  description:
    "Permanent hiring, contract staffing, executive search, bulk and campus hiring, payroll and HR consulting — one accountable partner across the talent lifecycle. Success-fee models, 3–5 day shortlists.",
  alternates: { canonical: "/services" },
};

const crumbs = [{ label: "Services", href: "/services" }];

export default function ServicesPage() {
  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Intro */}
      <section className="container-site pb-16 pt-4 md:pb-20" aria-labelledby="services-heading">
        <Reveal className="max-w-3xl">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Services</span>
          <h1 id="services-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            One partner for the <span className="text-gradient">entire talent lifecycle</span>
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-body md:text-lg">
            A single critical hire, two hundred joiners for a new facility, or the payroll that keeps them all paid —
            seven services, one engagement letter, one accountable team. Every service runs on the same operating
            system: specialist screening, honest timelines and numbers we publish.
          </p>
        </Reveal>
      </section>

      {/* Services grid */}
      <section className="bg-background-alt py-20 md:py-28" aria-labelledby="services-grid-heading">
        <div className="container-site">
          <h2 id="services-grid-heading" className="sr-only">
            All services
          </h2>
          <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {servicesContent.map((service, i) => (
              <RevealItem as="li" key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-card border border-line bg-surface p-7 shadow-soft transition-all duration-250 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between">
                    <IconChip name={service.icon} tone={i % 3 === 0 ? "primary" : i % 3 === 1 ? "secondary" : "accent"} />
                    <span className="rounded-full bg-background-alt px-2.5 py-1 text-[11.5px] font-semibold text-faint">
                      {service.bullets.length} things we handle
                    </span>
                  </div>
                  <h3 className="mt-5 text-[18px] font-bold group-hover:text-primary">{service.title}</h3>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-body">{service.short}</p>
                  <p className="mt-3 text-[13px] text-faint">{service.headline}</p>
                  <span className="mt-5 inline-flex items-center gap-1 border-t border-line pt-4 text-[13.5px] font-semibold text-primary">
                    Explore {service.title.toLowerCase()}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Employer vs candidate pathways */}
      <section className="container-site py-20 md:py-28" aria-labelledby="pathways-heading">
        <SectionHeading
          eyebrow="Start here"
          title="Two sides, one bridge"
          lead="Everything above is for employers. If you're a candidate, our entire service is free — and always will be."
        />
        <RevealGroup className="grid gap-5 md:grid-cols-2">
          <RevealItem>
            <div className="flex h-full flex-col rounded-card border border-line bg-surface p-8 shadow-soft">
              <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
                <BriefcaseBusiness className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-bold">I&apos;m hiring</h3>
              <ul className="mt-4 flex-1 space-y-2.5">
                {["Screened shortlist in 3–5 business days", "Success fees only — pay on joining", "Free replacement guarantee, in writing"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[14.5px] text-body">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/employers#request-talent"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-primary px-5 text-[15px] font-semibold text-white transition-all hover:bg-primary-strong hover:shadow-glow active:scale-[0.98]"
              >
                Request Talent
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="flex h-full flex-col rounded-card border border-line bg-surface p-8 shadow-soft">
              <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
                <UserRound className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-bold">I&apos;m looking for a job</h3>
              <ul className="mt-4 flex-1 space-y-2.5">
                {["Zero fees at every stage — always", "Track your application status live", "Free resume review and interview prep"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[14.5px] text-body">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/candidates"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-btn border border-line bg-surface px-5 text-[15px] font-semibold text-foreground shadow-soft transition-colors hover:border-faint active:scale-[0.98]"
              >
                Explore candidate services
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </RevealItem>
        </RevealGroup>
      </section>

      <CtaBand
        title="Not sure which service fits?"
        lead="Tell us the problem — we'll recommend the right engagement in one call."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
