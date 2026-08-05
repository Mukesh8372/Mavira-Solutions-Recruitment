import type { Metadata } from "next";
import { AlarmClock, CalendarCheck, Check, ShieldCheck } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { Icon } from "@/components/shared/icon";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getProcessContent } from "@/features/site-content/queries";

export const metadata: Metadata = {
  title: "Our Recruitment Process — A Structured 8-Step Methodology",
  description:
    "How Mavira Solutions runs a search: understand the requirement, search and screen, client interviews and assessment, then offer, onboarding and follow-up — a structured 8-step hiring methodology.",
  alternates: { canonical: "/process" },
};

/** Editorial detail layered on top of the shared process content. */
const stepDetail: Record<number, string[]> = {
  1: [
    "Deep comprehension of the role, team and expectations — agreed in writing",
    "Search across our professional database, referrals and targeted headhunting",
    "Interview panel, rounds and decision-makers locked upfront",
  ],
  2: [
    "Resume screening and pre-filtering against the agreed scorecard",
    "Preliminary interview by a domain-specialist recruiter",
    "Certifications, comp expectations and notice periods verified before shortlisting",
  ],
  3: [
    "Vetted profiles with screening notes — never a resume dump",
    "All scheduling handled by us, across every round",
    "Fast feedback loops in both directions; candidates kept engaged throughout",
  ],
  4: [
    "Offer and salary negotiation managed end to end",
    "Joining support and onboarding coordination until day one",
    "Follow-up and relationship management well beyond joining",
  ],
};

const yourPart = [
  {
    icon: "messages-square",
    title: "45 minutes for the intake call",
    body: "One structured conversation with the hiring manager. It's the highest-leverage meeting of the entire search — briefs taken over email produce shortlists that miss.",
  },
  {
    icon: "gauge",
    title: "Fast interview feedback",
    body: "Strong candidates hold for days, not weeks. Closing feedback quickly after each round is the single biggest factor you control.",
  },
  {
    icon: "list-checks",
    title: "A decision-maker per round",
    body: "Tell us who can say yes at each stage. Searches stall when interviews happen but decisions don't — we'll help you design the panel if useful.",
  },
];

const slas = [
  {
    icon: CalendarCheck,
    value: "1 biz day",
    title: "First response",
    body: "Every new brief gets a response within one business day — and an honest timeline for your specific role and market on the intake call.",
  },
  {
    icon: AlarmClock,
    value: "8 steps",
    title: "Structured methodology",
    body: "The same structured hiring methodology on every search — from understanding the requirement to follow-up after joining.",
  },
  {
    icon: ShieldCheck,
    value: "In writing",
    title: "Replacement guarantee",
    body: "If a permanent placement exits in the agreed guarantee period, we replace them free. It's in the engagement letter.",
  },
];

const crumbs = [{ label: "Process", href: "/process" }];

export default async function ProcessPage() {
  const { steps: recruitmentProcess } = await getProcessContent();
  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Intro */}
      <section className="container-site pb-16 pt-4 md:pb-20" aria-labelledby="process-heading">
        <Reveal className="max-w-3xl">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">How we work</span>
          <h1 id="process-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            A structured <span className="text-gradient">8-step methodology</span>
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-body md:text-lg">
            No mystery, no &ldquo;trust us&rdquo; — here is exactly what happens after you brief us, what happens at
            each stage, how long it takes, and what we need from you to keep it fast.
          </p>
        </Reveal>
      </section>

      {/* Vertical timeline */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="The four steps">
        <div className="container-site max-w-4xl">
          <RevealGroup as="ol" className="relative space-y-10 md:space-y-12">
            <div aria-hidden className="absolute bottom-8 left-6 top-8 hidden w-px bg-line md:block" />
            {recruitmentProcess.map((step, stepIndex) => (
              <RevealItem as="li" key={step.title} className="relative md:pl-24">
                <div className="mb-4 flex items-center gap-4 md:absolute md:left-0 md:top-0 md:mb-0 md:block">
                  <span className="relative z-10 grid size-12 place-items-center rounded-xl bg-brand-gradient text-white shadow-card">
                    <Icon name={step.icon} className="size-5" />
                  </span>
                </div>
                <div className="rounded-card border border-line bg-surface p-7 shadow-soft md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                      {stepIndex + 1}. {step.title}
                    </h2>
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
                      {step.duration}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-body">{step.body}</p>
                  <ul className="mt-4 space-y-2">
                    {(stepDetail[stepIndex + 1] ?? []).map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[14px] text-body">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* What we need from you */}
      <section className="container-site py-20 md:py-28" aria-label="What we need from you">
        <SectionHeading
          eyebrow="Your part"
          title="What we need from you"
          lead="Three asks. Clients who deliver all three hire dramatically faster."
        />
        <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3">
          {yourPart.map((item, i) => (
            <RevealItem as="li" key={item.title}>
              <div className="h-full rounded-card border border-line bg-surface p-7 shadow-soft">
                <span
                  className={`grid size-12 place-items-center rounded-xl ${
                    i === 0 ? "bg-primary-soft text-primary" : i === 1 ? "bg-secondary-soft text-secondary" : "bg-accent-soft text-accent"
                  }`}
                >
                  <Icon name={item.icon} className="size-5" />
                </span>
                <h3 className="mt-4 text-[16.5px] font-bold">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-body">{item.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* SLA trio */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="Our service-level commitments">
        <div className="container-site">
          <SectionHeading
            eyebrow="In writing"
            title="Commitments we sign, not say"
            lead="Every engagement letter carries these three SLAs — ask any client whether we keep them."
          />
          <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3">
            {slas.map((sla) => (
              <RevealItem as="li" key={sla.title}>
                <div className="h-full rounded-card border border-line bg-surface p-8 text-center shadow-card">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-gradient text-white">
                    <sla.icon className="size-5" aria-hidden />
                  </span>
                  <p className="mt-5 text-3xl font-extrabold tracking-tight text-foreground">{sla.value}</p>
                  <h3 className="mt-1 text-[15px] font-bold text-primary">{sla.title}</h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-body">{sla.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBand
        title="See the process from the inside."
        lead="Brief us on one role — the intake call alone is worth your 45 minutes."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
