import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  AchievementsForm,
  AnnouncementForm,
  ContactDetailsForm,
  HeroForm,
  ProcessForm,
  WhyUsForm,
} from "@/features/site-content/content-forms";
import {
  getAchievements,
  getAnnouncement,
  getContactContent,
  getHeroContent,
  getProcessContent,
  getWhyUsContent,
} from "@/features/site-content/queries";

export const metadata: Metadata = { title: "Site content", robots: { index: false } };

const sections = [
  { id: "announcement", title: "Announcement bar", note: "Promo strip above the header on every public page — toggle on for events and updates." },
  { id: "hero", title: "Homepage hero", note: "Badge line, headline and supporting text at the top of the homepage." },
  { id: "process", title: "How it works", note: "The 4-stage process shown on the homepage, employer page, process page and service pages." },
  { id: "why-us", title: "Why Mavira Solutions", note: "The 4 differentiator cards on the homepage and why-choose-us page." },
  { id: "achievements", title: "Registration & recognition", note: "The registration/recognition strip on the homepage and about page." },
  { id: "contact", title: "Contact details", note: "Phone, WhatsApp, email, address, hours and social links — used in the header, footer, contact page and search-engine data." },
] as const;

export default async function SiteContentPage() {
  const [hero, process, whyUs, announcement, achievements, contact] = await Promise.all([
    getHeroContent(),
    getProcessContent(),
    getWhyUsContent(),
    getAnnouncement(),
    getAchievements(),
    getContactContent(),
  ]);

  const forms: Record<(typeof sections)[number]["id"], React.ReactNode> = {
    announcement: <AnnouncementForm initial={announcement} />,
    hero: <HeroForm initial={hero} />,
    process: <ProcessForm initial={process} />,
    "why-us": <WhyUsForm initial={whyUs} />,
    achievements: <AchievementsForm initial={achievements} />,
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
