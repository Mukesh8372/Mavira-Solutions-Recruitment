import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Star } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Avatar } from "@/components/ui/avatar";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { IconChip } from "@/components/shared/icon";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { getApprovedTestimonials, getFaqs } from "@/features/content/queries";
import { getLatestJobs } from "@/features/jobs/queries";
import { JobCard } from "@/features/jobs/job-card";
import { ResumeUploadForm } from "@/features/candidates/resume-upload-form";

export const metadata: Metadata = {
  title: "For Candidates — Jobs, Resume Review & Career Support",
  description:
    "Zero fees, ever. Browse verified openings, upload your resume for matching roles, get free resume reviews and interview prep, and track every application's status live.",
  alternates: { canonical: "/candidates" },
};

const candidateServices = [
  {
    icon: "search",
    title: "Job search that starts with you",
    body: "One conversation about what you actually want — comp, commute, growth, culture — before a single role is pitched. You'll never be spammed with irrelevant JDs.",
  },
  {
    icon: "file-search",
    title: "Free resume review",
    body: "A specialist recruiter sends you three specific improvements within two business days — the same lens we use when we screen for clients.",
  },
  {
    icon: "messages-square",
    title: "Interview preparation",
    body: "Role-specific mock rounds, the questions this employer actually asks, and honest feedback before the real thing. Our candidates walk in knowing what's coming.",
  },
  {
    icon: "target",
    title: "Skill & market guidance",
    body: "Which certification moves your salary band, which city pays what for your role, when to switch and when to stay — advice backed by thousands of live offers a year.",
  },
  {
    icon: "handshake",
    title: "Placement & joining support",
    body: "Offer negotiation, counter-offer navigation, notice-period logistics and first-week check-ins. We stay with you until you're settled, not just placed.",
  },
];

const trackingSteps = [
  {
    step: "1",
    title: "Apply in under two minutes",
    body: "Apply to a role or join the talent pool — no account needed upfront. We create your candidate profile automatically.",
  },
  {
    step: "2",
    title: "Watch your status move",
    body: "Screening, shortlisted, interview, offer — every stage updates on your dashboard in real time. No black holes, no guessing.",
  },
  {
    step: "3",
    title: "Get answers either way",
    body: "If a role closes or you're not shortlisted, we tell you — with feedback where we have it. You always know where you stand.",
  },
];

const crumbs = [{ label: "Candidates", href: "/candidates" }];

export default async function CandidatesPage() {
  const [jobs, testimonials, faqs] = await Promise.all([
    getLatestJobs(4),
    getApprovedTestimonials("CANDIDATE"),
    getFaqs("CANDIDATE"),
  ]);
  const quotes = testimonials.slice(0, 3);

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="candidates-heading">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-[-10%] size-[560px] rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(16,185,129,.12), transparent 70%), radial-gradient(closest-side, rgba(37,99,235,.10), transparent 70%)",
          }}
        />
        <div className="container-site relative pb-16 pt-4 md:pb-24">
          <Reveal className="max-w-3xl">
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">For candidates</span>
            <h1 id="candidates-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-[52px] md:leading-[1.08]">
              Your career, <span className="text-gradient">handled with care</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-body md:text-lg">
              A consultant who listens before pitching, interviews that match what you asked for, and a live status on
              every application. All of it free — our fees come from employers, never from you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/jobs"
                className="group inline-flex h-12 items-center gap-2 rounded-btn bg-primary px-7 text-base font-semibold text-white transition-all hover:bg-primary-strong hover:shadow-glow active:scale-[0.98]"
              >
                Browse open roles
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <a
                href="#upload-resume"
                className="inline-flex h-12 items-center rounded-btn border border-line bg-surface px-7 text-base font-semibold text-foreground shadow-soft transition-colors hover:border-faint active:scale-[0.98]"
              >
                Upload your resume
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Candidate services */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="Candidate services">
        <div className="container-site">
          <SectionHeading
            eyebrow="What you get"
            title="Five things we do for every candidate"
            lead="The same support whether you're a fresher or a CXO — because the next role matters just as much either way."
          />
          <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {candidateServices.map((s, i) => (
              <RevealItem as="li" key={s.title}>
                <div className="h-full rounded-card border border-line bg-surface p-6 shadow-soft">
                  <IconChip name={s.icon} tone={i % 3 === 0 ? "primary" : i % 3 === 1 ? "secondary" : "accent"} />
                  <h3 className="mt-4 text-[16px] font-bold">{s.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-body">{s.body}</p>
                </div>
              </RevealItem>
            ))}
            {/* Zero-fees trust tile completes the grid */}
            <RevealItem as="li">
              <div className="flex h-full flex-col rounded-card bg-brand-gradient p-6 text-white">
                <span className="grid size-12 place-items-center rounded-xl bg-white/15">
                  <BadgeCheck className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-[16px] font-bold text-white">And it costs you nothing</h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-white/85">
                  No registration fees, no &ldquo;processing charges&rdquo;, no salary deductions — at any stage.
                  Anyone demanding money in our name is committing fraud; report it to us immediately.
                </p>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Resume upload */}
      <section id="upload-resume" className="container-site scroll-mt-24 py-20 md:py-28" aria-labelledby="upload-heading">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Talent pool</span>
            <h2 id="upload-heading" className="mt-3 text-3xl font-bold tracking-tight md:text-[40px] md:leading-[1.2]">
              Upload once. <br className="hidden md:block" />
              Get called when it <span className="text-gradient">actually fits.</span>
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-body">
              Not every great role makes it to a job board. Join our talent pool and a specialist recruiter will call
              you when a matching role opens — including the confidential ones.
            </p>
            <ul className="mt-7 space-y-3 text-[14.5px] text-body">
              <li className="flex items-start gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                4-lakh candidate database, matched by specialists — not keyword bots
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                Your profile is shared with employers only for roles you match
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                Update or withdraw your resume any time — it&apos;s your data
              </li>
            </ul>
          </Reveal>
          <Reveal>
            <div className="relative rounded-card border border-line bg-surface p-6 shadow-card md:p-8">
              <ResumeUploadForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Latest jobs */}
      {jobs.length > 0 && (
        <section className="bg-background-alt py-20 md:py-28" aria-label="Latest openings">
          <div className="container-site">
            <SectionHeading
              eyebrow="Fresh this week"
              title="Latest verified openings"
              lead="Every listing is actively worked by a recruiter — apply in under two minutes."
            />
            <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {jobs.map((job) => (
                <RevealItem as="li" key={job.id}>
                  <JobCard job={job} />
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal className="mt-10 text-center">
              <Link href="/jobs" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline">
                See all open roles
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Application tracking explainer */}
      <section className="container-site py-20 md:py-28" aria-label="How application tracking works">
        <SectionHeading
          eyebrow="No black holes"
          title="How application tracking works"
          lead="The most common complaint about job hunting is silence. We engineered it out."
        />
        <RevealGroup as="ol" className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          {trackingSteps.map((s) => (
            <RevealItem as="li" key={s.step} className="relative rounded-card border border-line bg-surface p-7 shadow-soft">
              <span className="grid size-10 place-items-center rounded-full bg-brand-gradient text-[15px] font-extrabold text-white">
                {s.step}
              </span>
              <h3 className="mt-4 text-[16px] font-bold">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-body">{s.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Candidate testimonials */}
      {quotes.length > 0 && (
        <section className="bg-background-alt py-20 md:py-28" aria-label="Candidate stories">
          <div className="container-site">
            <SectionHeading
              eyebrow="Placed people"
              title="Candidates who'd do it again"
              lead="Real placements — most of our candidates come from referrals by people we've placed."
            />
            <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3">
              {quotes.map((t) => (
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

      {/* Candidate FAQ */}
      {faqs.length > 0 && (
        <section className="container-site py-20 md:py-28" aria-label="Candidate FAQ">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="FAQ"
              title="What candidates ask us"
              lead="Straight answers — including the one about fees. (There are none.)"
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

      <CtaBand
        title="Ready for a better next chapter?"
        lead="Browse live roles or join the talent pool — either way, a specialist has your back."
        primary={{ label: "Browse open roles", href: "/jobs" }}
        secondary={{ label: "Upload your resume", href: "/candidates#upload-resume" }}
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
    </>
  );
}
