import type { Metadata } from "next";
import { Check, Star, X } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Avatar } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { IconChip } from "@/components/shared/icon";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { StatsBand } from "@/features/home/stats-band";
import { getApprovedTestimonials, getSiteStats } from "@/features/content/queries";
import { getWhyUsContent } from "@/features/site-content/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Why Choose Us — Specialists, Speed, Transparency",
  description:
    "What sets TalentBridge apart: domain-specialist screening, 3–5 day shortlists, live pipeline visibility and success-only fees — with the numbers to back every claim.",
  alternates: { canonical: "/why-choose-us" },
};

/** Editorial expansion of each whyChooseUs pillar for the split rows. */
const pillarDetail: Record<string, { proof: { label: string; value: string }[]; extra: string }> = {
  "Specialists, not generalists": {
    extra:
      "Our recruiters spend years in one vertical. They know that a strong credit-risk profile looks nothing like a strong warehouse-supervisor profile — and they screen accordingly, with structured interviews and domain-specific rubrics.",
    proof: [
      { label: "Verticals with dedicated desks", value: "8" },
      { label: "Structured interview per candidate", value: "1, always" },
    ],
  },
  "Speed you can plan around": {
    extra:
      "Speed isn't heroics — it's a 4-lakh candidate database, pre-built sourcing playbooks per role family, and SLAs we actually track. You get a committed timeline on the intake call and a live pipeline after it.",
    proof: [
      { label: "Shortlist SLA (most roles)", value: "3–5 days" },
      { label: "Average time-to-offer", value: "19 days" },
    ],
  },
  "Radical transparency": {
    extra:
      "Employers see sourced, screened, shortlisted and scheduled in one view. Candidates see their status change in real time. When something slips, you hear it from us first — with the revised plan attached.",
    proof: [
      { label: "Interview feedback closed within", value: "24 hrs" },
      { label: "Applications with a visible status", value: "100%" },
    ],
  },
  "Skin in the game": {
    extra:
      "No retainers for standard roles, free replacement guarantees in the engagement letter, and zero fees to candidates ever. If a placement doesn't work out, the cost is ours — which is exactly why so few don't.",
    proof: [
      { label: "Offer-to-join rate", value: "90%+" },
      { label: "First-year retention", value: "94%" },
    ],
  },
};

const comparison = [
  {
    dimension: "Screening",
    us: "Structured interview by a domain specialist before you see any profile",
    them: "Keyword-matched resumes forwarded from job boards",
  },
  {
    dimension: "Fees",
    us: "Success fee on joining; no retainers for standard roles",
    them: "Upfront retainers, sourcing fees, or opaque slabs",
  },
  {
    dimension: "Guarantee",
    us: "Free replacement, stated in the engagement letter",
    them: "\"Best effort\" verbal assurances",
  },
  {
    dimension: "Tracking",
    us: "Live pipeline for employers; real-time status for candidates",
    them: "Weekly email — if you chase for it",
  },
  {
    dimension: "Specialists",
    us: "Recruiters organised by industry vertical",
    them: "Whoever on the desk is free that day",
  },
];

const crumbs = [{ label: "Why Choose Us", href: "/why-choose-us" }];

export default async function WhyChooseUsPage() {
  const [stats, testimonials, { cards: whyChooseUs }] = await Promise.all([
    getSiteStats(),
    getApprovedTestimonials(),
    getWhyUsContent(),
  ]);
  // Editorial proof blocks follow pillar position, not title, so renames in admin can't orphan them.
  const pillarDetails = Object.values(pillarDetail);
  const mixed = [
    ...testimonials.filter((t) => t.kind === "CLIENT").slice(0, 2),
    ...testimonials.filter((t) => t.kind === "CANDIDATE").slice(0, 1),
  ];

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Intro */}
      <section className="container-site pb-16 pt-4 md:pb-20" aria-labelledby="why-heading">
        <Reveal className="max-w-3xl">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Why TalentBridge</span>
          <h1 id="why-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            Agencies send resumes. <span className="text-gradient">We send answers.</span>
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-body md:text-lg">
            Every claim below has a number attached, and every number comes from our live delivery dashboard — the
            same one our clients see. That&apos;s the difference in one sentence.
          </p>
        </Reveal>
      </section>

      {/* Alternating pillar rows */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="What sets us apart">
        <div className="container-site space-y-16 md:space-y-20">
          {whyChooseUs.map((pillar, i) => {
            const detail = pillarDetails[i];
            return (
              <Reveal key={pillar.title}>
                <div
                  className={cn(
                    "grid items-center gap-8 lg:grid-cols-2 lg:gap-16",
                    i % 2 === 1 && "lg:[&>*:first-child]:order-2"
                  )}
                >
                  <div>
                    <IconChip name={pillar.icon} tone={i % 2 === 0 ? "primary" : "accent"} />
                    <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-3xl">{pillar.title}</h2>
                    <p className="mt-3 text-[15.5px] leading-relaxed text-body">{pillar.body}</p>
                    {detail && <p className="mt-3 text-[15.5px] leading-relaxed text-body">{detail.extra}</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(detail?.proof ?? []).map((p) => (
                      <div key={p.label} className="rounded-card border border-line bg-surface p-6 shadow-soft">
                        <p className="text-3xl font-extrabold tracking-tight text-foreground">{p.value}</p>
                        <p className="mt-1.5 text-[13px] font-medium text-body">{p.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <StatsBand stats={stats} />

      {/* Comparison table */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="TalentBridge versus a typical agency">
        <div className="container-site">
          <SectionHeading
            eyebrow="Side by side"
            title="Us vs. the typical agency"
            lead="Ask any agency these five questions before you sign — including us."
          />
          <Reveal>
            <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-soft">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <caption className="sr-only">Comparison of TalentBridge against a typical recruitment agency</caption>
                <thead>
                  <tr className="border-b border-line bg-background-alt">
                    <th scope="col" className="px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-faint">
                      What to compare
                    </th>
                    <th scope="col" className="px-6 py-4 text-[14px] font-bold text-primary">
                      TalentBridge
                    </th>
                    <th scope="col" className="px-6 py-4 text-[14px] font-bold text-body">
                      Typical agency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.dimension} className="border-b border-line last:border-b-0">
                      <th scope="row" className="whitespace-nowrap px-6 py-5 align-top text-[14.5px] font-bold text-foreground">
                        {row.dimension}
                      </th>
                      <td className="px-6 py-5 align-top">
                        <span className="flex items-start gap-2 text-[14px] leading-relaxed text-body">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                            <Check className="size-3" strokeWidth={3} aria-hidden />
                          </span>
                          {row.us}
                        </span>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span className="flex items-start gap-2 text-[14px] leading-relaxed text-faint">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                            <X className="size-3" strokeWidth={3} aria-hidden />
                          </span>
                          {row.them}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials mix */}
      {mixed.length > 0 && (
        <section className="container-site py-20 md:py-28" aria-label="What clients and candidates say">
          <SectionHeading
            eyebrow="Don't take our word"
            title="Both sides of the table agree"
            lead="Employer and candidate reviews, pulled from the same approved pool we publish everywhere."
          />
          <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3">
            {mixed.map((t) => (
              <RevealItem as="li" key={t.id}>
                <figure className="flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5 text-warning" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" aria-hidden />
                      ))}
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
                        t.kind === "CLIENT" ? "bg-secondary-soft text-secondary" : "bg-accent-soft text-accent"
                      )}
                    >
                      {t.kind === "CLIENT" ? "Employer" : "Candidate"}
                    </span>
                  </div>
                  <blockquote className="mt-4 flex-1">
                    <p className="text-[14.5px] leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                    <Avatar name={t.authorName} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-foreground">{t.authorName}</p>
                      <p className="truncate text-[12.5px] text-faint">
                        {t.authorRole}
                        {t.company ? ` · ${t.company}` : ""}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}

      <CtaBand
        title="Put us to the test."
        lead="Give us your hardest open role — the one that's been open too long."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
