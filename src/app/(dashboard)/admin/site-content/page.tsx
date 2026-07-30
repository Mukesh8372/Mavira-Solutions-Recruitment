import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  AchievementsForm,
  AnnouncementForm,
  ContactDetailsForm,
  HeroForm,
  LogosForm,
  ProcessForm,
  StatsForm,
  TeamForm,
  WhyUsForm,
} from "@/features/site-content/content-forms";
import {
  getAchievements,
  getAnnouncement,
  getClientLogos,
  getContactContent,
  getHeroContent,
  getProcessContent,
  getTeam,
  getWhyUsContent,
} from "@/features/site-content/queries";
import { getSiteStats } from "@/features/content/queries";

export const metadata: Metadata = { title: "Site content", robots: { index: false } };

const sections = [
  { id: "announcement", title: "Announcement bar", note: "Promo strip above the header on every public page — toggle on for drives and events." },
  { id: "hero", title: "Homepage hero", note: "Badge line, headline and supporting text at the top of the homepage." },
  { id: "stats", title: "Statistics", note: "The animated counters shown on the homepage, employer page and about page." },
  { id: "logos", title: "Trusted-by logos", note: "Company names in the rolling strip under the hero." },
  { id: "process", title: "How it works", note: "The 4-step process shown on the homepage, employer page, process page and service pages." },
  { id: "why-us", title: "Why TalentBridge", note: "The 4 differentiator cards on the homepage and why-choose-us page." },
  { id: "achievements", title: "Awards & recognition", note: "The achievements strip on the homepage and about page." },
  { id: "team", title: "Leadership team", note: "The team section on the about page." },
  { id: "contact", title: "Contact details", note: "Phone, WhatsApp, email, address, hours and social links — used in the header, footer, contact page and search-engine data." },
] as const;

export default async function SiteContentPage() {
  const [hero, stats, logos, process, whyUs, announcement, achievements, team, contact] = await Promise.all([
    getHeroContent(),
    getSiteStats(),
    getClientLogos(),
    getProcessContent(),
    getWhyUsContent(),
    getAnnouncement(),
    getAchievements(),
    getTeam(),
    getContactContent(),
  ]);

  const forms: Record<(typeof sections)[number]["id"], React.ReactNode> = {
    announcement: <AnnouncementForm initial={announcement} />,
    hero: <HeroForm initial={hero} />,
    stats: <StatsForm initial={stats} />,
    logos: <LogosForm initial={logos} />,
    process: <ProcessForm initial={process} />,
    "why-us": <WhyUsForm initial={whyUs} />,
    achievements: <AchievementsForm initial={achievements} />,
    team: <TeamForm initial={team} />,
    contact: (
      <ContactDetailsForm
        initial={{
          phone: contact.phone,
          whatsapp: contact.whatsapp,
          email: contact.email,
          street: contact.street,
          city: contact.city,
          state: contact.state,
          postalCode: contact.postalCode,
          hours: contact.hours,
          responseSla: contact.responseSla,
          social: contact.social,
        }}
      />
    ),
  };

  return (
    <>
      <PageHeader
        title="Site content"
        description="Edit the words and numbers on the public site. Layouts are fixed — changes go live immediately after saving."
      />
      <nav aria-label="Content sections" className="mb-6 flex flex-wrap gap-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-body transition-colors hover:border-primary hover:text-primary"
          >
            {s.title}
          </a>
        ))}
      </nav>
      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-heading`} className="scroll-mt-24 rounded-card border border-line bg-surface p-6 shadow-soft">
            <h2 id={`${s.id}-heading`} className="text-[16px] font-bold">
              {s.title}
            </h2>
            <p className="mb-5 mt-1 text-[13px] text-faint">{s.note}</p>
            {forms[s.id]}
          </section>
        ))}
      </div>
    </>
  );
}
