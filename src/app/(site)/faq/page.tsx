import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, MessageCircle, UserRound, Users } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Reveal } from "@/components/shared/reveal";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { getFaqs } from "@/features/content/queries";
import { getContactContent } from "@/features/site-content/queries";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "FAQ — Fees, Timelines, Guarantees & More",
  description:
    "Everything employers and candidates ask us — fees and success models, shortlist timelines, replacement guarantees, application tracking and our zero-fee promise to candidates.",
  alternates: { canonical: "/faq" },
};

const groups = [
  {
    id: "employers",
    audience: "EMPLOYER" as const,
    label: "For employers",
    icon: BriefcaseBusiness,
    lead: "Fees, shortlists, guarantees — what to know before you brief us.",
  },
  {
    id: "candidates",
    audience: "CANDIDATE" as const,
    label: "For candidates",
    icon: UserRound,
    lead: "Applying, tracking and the zero-fee promise.",
  },
  {
    id: "general",
    audience: "GENERAL" as const,
    label: "General",
    icon: Users,
    lead: "Coverage, industries and what makes us different.",
  },
];

const crumbs = [{ label: "FAQ", href: "/faq" }];

export default async function FaqPage() {
  const [allFaqs, contact] = await Promise.all([getFaqs(), getContactContent()]);

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Header + anchor nav */}
      <section className="container-site pb-12 pt-4 md:pb-14" aria-labelledby="faq-heading">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">FAQ</span>
          <h1 id="faq-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            Questions, answered <span className="text-gradient">honestly</span>
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-body">
            The things employers and candidates actually ask us — including the awkward ones about fees.
          </p>
          <nav aria-label="FAQ sections" className="mt-7 flex flex-wrap justify-center gap-2">
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13.5px] font-semibold text-body transition-colors hover:border-primary hover:text-primary"
              >
                <g.icon className="size-4" aria-hidden />
                {g.label}
              </a>
            ))}
          </nav>
        </Reveal>
      </section>

      {/* Grouped accordions */}
      {groups.map((group, gi) => {
        const items = allFaqs.filter((f) => f.audience === group.audience);
        if (items.length === 0) return null;
        return (
          <section
            key={group.id}
            id={group.id}
            className={`scroll-mt-24 py-16 md:py-20 ${gi % 2 === 0 ? "bg-background-alt" : ""}`}
            aria-labelledby={`${group.id}-heading`}
          >
            <div className="container-site max-w-3xl">
              <Reveal>
                <div className="mb-8 flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <group.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h2 id={`${group.id}-heading`} className="text-2xl font-bold tracking-tight md:text-3xl">
                      {group.label}
                    </h2>
                    <p className="mt-1 text-[14.5px] text-body">{group.lead}</p>
                  </div>
                </div>
              </Reveal>
              <Reveal>
                <Accordion defaultOpen={gi === 0 ? items[0]?.id : undefined}>
                  {items.map((faq) => (
                    <AccordionItem key={faq.id} id={faq.id} title={faq.question}>
                      {faq.answer}
                    </AccordionItem>
                  ))}
                </Accordion>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* Contact escape hatch */}
      <section className="container-site py-16 md:py-20" aria-label="Still have questions">
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-card border border-line bg-surface p-8 text-center shadow-card md:p-10">
            <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
              <MessageCircle className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight md:text-2xl">Didn&apos;t find your answer?</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-body">
                A human replies to every message. {contact.responseSla}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="group inline-flex h-11 items-center gap-2 rounded-btn bg-primary px-6 text-[15px] font-semibold text-white transition-all hover:bg-primary-strong hover:shadow-glow active:scale-[0.98]"
              >
                Contact us
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <a
                href={contact.phoneHref}
                className="inline-flex h-11 items-center rounded-btn border border-line bg-surface px-6 text-[15px] font-semibold text-foreground shadow-soft transition-colors hover:border-faint active:scale-[0.98]"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {allFaqs.length > 0 && <JsonLd data={faqJsonLd(allFaqs)} />}
    </>
  );
}
