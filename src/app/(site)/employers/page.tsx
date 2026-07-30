import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Phone, Star } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Avatar } from "@/components/ui/avatar";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { Icon, IconChip } from "@/components/shared/icon";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { StatsBand } from "@/features/home/stats-band";
import { getApprovedTestimonials, getFaqs, getSiteStats } from "@/features/content/queries";
import { RequestTalentForm } from "@/features/leads/request-talent-form";
import { servicesContent } from "@/content/services";
import { getProcessContent, getContactContent } from "@/features/site-content/queries";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "For Employers — Request Talent",
  description:
    "Your next great hire is already in our pipeline. Screened shortlists in 3–5 days, success fees only, free replacement guarantee. Request talent and a delivery lead calls within one business day.",
  alternates: { canonical: "/employers" },
};

const painPoints = [
  {
    icon: "gauge",
    title: "Agencies that move at agency speed",
    body: "A role open for eight weeks costs more than any fee. Our shortlists land in 3–5 business days for most roles, and every brief gets an honest timeline on the intake call — not after three follow-ups.",
  },
  {
    icon: "file-clock",
    title: "Fifty resumes, zero screening",
    body: "Forwarding a job-board export isn't recruitment. Every profile we send has been interviewed by a domain-specialist recruiter, with screening notes and comp expectations attached.",
  },
  {
    icon: "eye",
    title: "Radio silence after the kickoff",
    body: "You should never have to ask 'any update?'. A live pipeline view shows sourced, screened, shortlisted and scheduled — and interview feedback is closed within 24 hours.",
  },
];

const trustBullets = [
  "Shortlist in 3–5 business days for most roles",
  "Success fee only — you pay when the candidate joins",
  "Free replacement guarantee, stated in the engagement letter",
  "Live pipeline visibility from day one",
  "One delivery lead accountable end to end",
];

const crumbs = [{ label: "Employers", href: "/employers" }];

export default async function EmployersPage() {
  const [stats, testimonials, faqs, { steps: recruitmentProcess }, contact] = await Promise.all([
    getSiteStats(),
    getApprovedTestimonials("CLIENT"),
    getFaqs("EMPLOYER"),
    getProcessContent(),
    getContactContent(),
  ]);
  const clientQuotes = testimonials.slice(0, 3);

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="employers-heading">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] size-[560px] rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(37,99,235,.14), transparent 70%), radial-gradient(closest-side, rgba(124,58,237,.10), transparent 70%)",
          }}
        />
        <div className="container-site relative pb-16 pt-4 md:pb-24">
          <Reveal className="max-w-3xl">
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">For employers</span>
            <h1 id="employers-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-[52px] md:leading-[1.08]">
              Your next great hire is <span className="text-gradient">already in our pipeline</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-body md:text-lg">
              A 4-lakh candidate database, specialist recruiters in eight verticals, and a delivery engine that has
              closed 12,000+ roles. Tell us what you need — the first shortlist usually lands before your next
              weekly review.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#request-talent"
                className="group inline-flex h-12 items-center gap-2 rounded-btn bg-primary px-7 text-base font-semibold text-white transition-all hover:bg-primary-strong hover:shadow-glow active:scale-[0.98]"
              >
                Request Talent
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
              <a
                href={contact.phoneHref}
                className="inline-flex h-12 items-center gap-2 rounded-btn border border-line bg-surface px-7 text-base font-semibold text-foreground shadow-soft transition-colors hover:border-faint active:scale-[0.98]"
              >
                <Phone className="size-4 text-primary" aria-hidden />
                {contact.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pain points */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="Problems we fix">
        <div className="container-site">
          <SectionHeading
            eyebrow="Sound familiar?"
            title="Three ways hiring partners fail you"
            lead="We built TalentBridge around the three complaints every HR head has about agencies."
          />
          <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3">
            {painPoints.map((p, i) => (
              <RevealItem as="li" key={p.title}>
                <div className="h-full rounded-card border border-line bg-surface p-7 shadow-soft">
                  <IconChip name={p.icon} tone={i === 0 ? "primary" : i === 1 ? "secondary" : "accent"} />
                  <h3 className="mt-4 text-[16.5px] font-bold">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-body">{p.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Services grid (compact) */}
      <section className="container-site py-20 md:py-28" aria-label="Employer services">
        <SectionHeading
          eyebrow="What we run for you"
          title="Seven services, one engagement letter"
          lead="Mix and match — most clients start with one role and end up consolidating three vendors."
        />
        <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {servicesContent.map((service) => (
            <RevealItem as="li" key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full items-start gap-3 rounded-card border border-line bg-surface p-5 shadow-soft transition-all duration-250 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon name={service.icon} className="size-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-bold text-foreground group-hover:text-primary">
                    {service.title}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-body">{service.short}</span>
                </span>
              </Link>
            </RevealItem>
          ))}
          <RevealItem as="li">
            <a
              href="#request-talent"
              className="group flex h-full flex-col justify-between rounded-card bg-brand-gradient p-5 text-white transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="text-[14.5px] font-bold">Not sure what you need?</span>
              <span className="mt-1 text-[12.5px] leading-relaxed text-white/85">
                One scoping call and we&apos;ll recommend the right engagement.
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold">
                Talk to us
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </a>
          </RevealItem>
        </RevealGroup>
      </section>

      {/* Process timeline */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="How it works">
        <div className="container-site">
          <SectionHeading
            eyebrow="How it works"
            title="From brief to joined, in four steps"
            lead="A process honed over 12,000 placements — transparent at every stage."
          />
          <RevealGroup as="ul" className="relative grid gap-8 md:grid-cols-4 md:gap-5">
            <div aria-hidden className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block" />
            {recruitmentProcess.map((step, i) => (
              <RevealItem as="li" key={step.title} className="relative">
                <div className="relative z-10 mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-card">
                  <Icon name={step.icon} className="size-5" />
                </div>
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Step {i + 1} · {step.duration}
                </p>
                <h3 className="mt-1.5 text-[17px] font-bold">{step.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-body">{step.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <StatsBand stats={stats} />

      {/* Client testimonials */}
      {clientQuotes.length > 0 && (
        <section className="bg-background-alt py-20 md:py-28" aria-label="What clients say">
          <div className="container-site">
            <SectionHeading
              eyebrow="Client proof"
              title="HR heads who stopped chasing agencies"
              lead="Verified reviews from employers we work with today."
            />
            <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3">
              {clientQuotes.map((t) => (
                <RevealItem as="li" key={t.id}>
                  <figure className="flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft">
                    <div className="flex gap-0.5 text-warning" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" aria-hidden />
                      ))}
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
          </div>
        </section>
      )}

      {/* Request talent */}
      <section id="request-talent" className="container-site scroll-mt-24 py-20 md:py-28" aria-labelledby="request-talent-heading">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Request talent</span>
            <h2 id="request-talent-heading" className="mt-3 text-3xl font-bold tracking-tight md:text-[40px] md:leading-[1.2]">
              Tell us the roles. <br className="hidden md:block" />
              We&apos;ll take it from here.
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-body">
              Two minutes of your time gets you a scoping call with a delivery lead — not a sales rep — within one
              business day.
            </p>
            <ul className="mt-7 space-y-3">
              {trustBullets.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[14.5px] text-body">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-[13.5px] text-faint">
              Prefer to talk first?{" "}
              <a href={contact.phoneHref} className="font-semibold text-primary hover:underline">
                {contact.phone}
              </a>{" "}
              · {siteConfig.hours}
            </p>
          </Reveal>
          <Reveal>
            <div className="relative rounded-card border border-line bg-surface p-6 shadow-card md:p-8">
              <RequestTalentForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Employer FAQ */}
      {faqs.length > 0 && (
        <section className="bg-background-alt py-20 md:py-28" aria-label="Employer FAQ">
          <div className="container-site max-w-3xl">
            <SectionHeading
              eyebrow="FAQ"
              title="What employers ask before signing"
              lead="Fees, timelines, guarantees — answered the way we'd want them answered."
            />
            <Reveal>
              <Accordion defaultOpen={faqs[0]?.id}>
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} id={faq.id} title={faq.question}>
                    {faq.answer}
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>
      )}

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
    </>
  );
}
