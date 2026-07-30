import type { Metadata } from "next";
import { Award } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { IconChip } from "@/components/shared/icon";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { StatsBand } from "@/features/home/stats-band";
import { getSiteStats } from "@/features/content/queries";
import { getAchievements, getTeam } from "@/features/site-content/queries";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us — Our Story, Values & Leadership",
  description: `${siteConfig.name} has connected employers with vetted talent since ${siteConfig.founded} — 12,000+ placements, 500+ client companies, one promise: the right people, faster. Meet the team behind the numbers.`,
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: "target",
    title: "Specialism over spray-and-pray",
    body: "Recruiters are organised by domain, not by desk availability. The person screening a credit-risk analyst has screened a hundred of them — that's the difference between a shortlist and a resume dump.",
  },
  {
    icon: "eye",
    title: "Transparency as default",
    body: "Employers see the live pipeline. Candidates see their application status. Our fees, guarantees and success rates are written down and public — nothing lives in the fine print.",
  },
  {
    icon: "shield-check",
    title: "Skin in the game",
    body: "Success fees only, free replacement guarantees, and zero charges for candidates — ever. When our incentives match yours, quality stops being a promise and becomes a business model.",
  },
  {
    icon: "handshake",
    title: "People, not positions",
    body: "A placement is someone's next three years, not a line item. We stay engaged through offer, joining and the first 90 days — because a hire that doesn't stick helps nobody.",
  },
];


const milestones = [
  { year: "2011", text: "Founded in Bengaluru with a two-person team and a focus on IT hiring." },
  { year: "2014", text: "Expanded into BFSI and manufacturing; crossed 1,000 placements." },
  { year: "2017", text: "Launched contract staffing and payroll services; opened Mumbai and Delhi NCR offices." },
  { year: "2020", text: "Built candidate status tracking — every applicant sees where they stand, no black holes." },
  { year: "2022", text: "Crossed 10,000 placements; executive search practice formalised." },
  { year: "2024", text: "Named Best Recruitment Firm (Mid-size) at the National Staffing Awards." },
];

const crumbs = [{ label: "About", href: "/about" }];

export default async function AboutPage() {
  const [{ items: achievements }, { members: leaders }] = await Promise.all([getAchievements(), getTeam()]);
  const stats = await getSiteStats();

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Story hero */}
      <section className="container-site pb-16 pt-4 md:pb-24" aria-labelledby="about-heading">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal>
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Our story</span>
            <h1 id="about-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
              Fifteen years of <span className="text-gradient">matchmaking at scale</span>
            </h1>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-body md:text-[17px]">
              <p>
                TalentBridge started in {siteConfig.founded} with a simple irritation: recruitment agencies sent
                resumes, not answers. Fifty CVs in an inbox isn&apos;t a service — it&apos;s homework. So we built the
                agency we wished existed: specialist recruiters who interview every candidate before a client ever
                sees them, and tell both sides the truth about the market.
              </p>
              <p>
                Today that irritation has become a delivery engine — 12,000+ placements across IT, BFSI, healthcare,
                manufacturing, retail and logistics, for 500+ companies from Series-A startups to listed banks. The
                model hasn&apos;t changed: shortlists in 3–5 days, feedback within 24 hours, a replacement guarantee in
                writing, and never a rupee charged to a candidate.
              </p>
            </div>
          </Reveal>
          <Reveal className="lg:pt-12">
            <ol className="relative space-y-6 border-l border-line pl-6">
              {milestones.map((m) => (
                <li key={m.year} className="relative">
                  <span aria-hidden className="absolute -left-[30px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-primary-soft" />
                  <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-primary">{m.year}</p>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-body">{m.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* Mission & values */}
      <section className="bg-background-alt py-20 md:py-28" aria-labelledby="values-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="Mission & values"
            title="What we optimise for"
            lead="Our mission is simple: make hiring fast and fair for companies, and job-hunting humane for people. Four values keep it honest."
          />
          <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2">
            {values.map((v, i) => (
              <RevealItem as="li" key={v.title}>
                <div className="h-full rounded-card border border-line bg-surface p-6 shadow-soft">
                  <IconChip name={v.icon} tone={i % 2 === 0 ? "primary" : "accent"} />
                  <h3 className="mt-4 text-[16.5px] font-bold">{v.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-body">{v.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <StatsBand stats={stats} />

      {/* Leadership */}
      <section className="bg-background-alt py-20 md:py-28" aria-labelledby="leadership-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="Leadership"
            title="The people behind the placements"
            lead="A leadership team that has done the work — every one of them has personally closed roles, run drives and sat across candidates."
          />
          <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {leaders.map((leader) => (
              <RevealItem as="li" key={leader.name}>
                <div className="h-full rounded-card border border-line bg-surface p-6 text-center shadow-soft">
                  <Avatar name={leader.name} className="mx-auto size-16 text-lg" />
                  <h3 className="mt-4 text-[16px] font-bold">{leader.name}</h3>
                  <p className="mt-0.5 text-[13px] font-semibold text-primary">{leader.role}</p>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-body">{leader.bio}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Certifications & awards */}
      <section className="container-site py-16 md:py-20" aria-labelledby="awards-heading">
        <h2 id="awards-heading" className="sr-only">
          Certifications and awards
        </h2>
        <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((a) => (
            <RevealItem
              as="li"
              key={a.title}
              className="flex items-start gap-3 rounded-card border border-line bg-surface p-5 shadow-soft"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-warning/12 text-warning">
                <Award className="size-4.5" aria-hidden />
              </span>
              <span>
                <span className="block text-[14px] font-bold text-foreground">{a.title}</span>
                <span className="block text-[12.5px] text-faint">
                  {a.org} · {a.year}
                </span>
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <CtaBand
        title="Work with people who place people."
        lead="One conversation is all it takes to see the difference specialism makes."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
