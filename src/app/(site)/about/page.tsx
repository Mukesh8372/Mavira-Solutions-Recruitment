import type { Metadata } from "next";
import { Award, Compass, Flag, Gem } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { IconChip } from "@/components/shared/icon";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getAchievements } from "@/features/site-content/queries";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us — Our Story, Vision & Mission",
  description: `${siteConfig.legalName} is a premier recruitment company for the BFSI and Broking industries — bridging the gap between exceptional talent and outstanding opportunities across India.`,
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: "target",
    title: "Specialism over spray-and-pray",
    body: "Our recruiters live in BFSI, broking and FinTech. The person screening a wealth RM or an equity dealer has screened a hundred of them — that's the difference between a shortlist and a resume dump.",
  },
  {
    icon: "eye",
    title: "Quality and trust first",
    body: "Founded with a commitment to quality and trust — every candidate is thoroughly vetted before a client sees them, and both sides hear the truth about the market.",
  },
  {
    icon: "shield-check",
    title: "Complete confidentiality",
    body: "Searches, briefs and candidate conversations stay confidential at every step — professional, reliable and discreet.",
  },
  {
    icon: "handshake",
    title: "People, not positions",
    body: "A placement is someone's next three years, not a line item. We stay engaged through offer, joining and follow-up — because a hire that doesn't stick helps nobody.",
  },
];

const pillars = [
  {
    icon: Compass,
    title: "Our Vision",
    body: "To become a trusted, nationally recognized recruitment partner by consistently providing reliable, efficient and tailored hiring solutions across India — bridging talent with opportunity in the BFSI and FinTech sectors.",
  },
  {
    icon: Flag,
    title: "Our Mission",
    body: "To deliver top-tier recruitment services by gaining deep comprehension of client requirements, providing thoroughly vetted candidates within optimal timelines, and building enduring trust-based relationships with both clients and candidates.",
  },
  {
    icon: Gem,
    title: "Our Core Strength",
    body: "Quality recruitment with unmatched quick turnaround time — combining industry expertise, a strong professional database, and a client-focused approach to deliver the right talent, every time.",
  },
];

const crumbs = [{ label: "About", href: "/about" }];

export default async function AboutPage() {
  const { items: achievements } = await getAchievements();

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Story hero */}
      <section className="container-site pb-16 pt-4 md:pb-24" aria-labelledby="about-heading">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal>
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">About us</span>
            <h1 id="about-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
              Connecting the right talent <span className="text-gradient">with the right opportunity</span>
            </h1>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-body md:text-[17px]">
              <p>
                {siteConfig.legalName} is a premier recruitment company specializing in sourcing high-caliber
                professionals for the BFSI and Broking industries. We bridge the gap between exceptional talent and
                outstanding opportunities.
              </p>
              <p>
                Our deep industry expertise spans Banking, Financial Services, Insurance, Stock Broking, Wealth
                Management, NBFC and FinTech sectors. We help companies find the right talent to drive growth, while
                empowering job seekers to build successful, fulfilling careers.
              </p>
              <p>
                Founded with a commitment to quality and trust, Mavira Solutions is your dedicated hiring partner —
                delivering reliable, efficient and tailored recruitment solutions across India.
              </p>
            </div>
          </Reveal>
          <Reveal className="lg:pt-12">
            <ul className="space-y-5">
              {pillars.map((p) => (
                <li key={p.title} className="rounded-card border border-line bg-surface p-6 shadow-soft">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                    <p.icon className="size-4.5" aria-hidden />
                  </span>
                  <h2 className="mt-3 text-[16px] font-bold">{p.title}</h2>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">{p.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background-alt py-20 md:py-28" aria-labelledby="values-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="Values"
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

      {/* Registration & recognition */}
      <section className="container-site py-16 md:py-20" aria-labelledby="awards-heading">
        <h2 id="awards-heading" className="sr-only">
          Company registration and recognition
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
