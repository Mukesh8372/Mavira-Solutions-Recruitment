import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { jsonValue } from "@/lib/utils";
import { achievements, clientLogos, recruitmentProcess, whyChooseUs } from "@/content/process";
import { siteConfig } from "@/config/site";
import {
  achievementsSchema,
  announcementSchema,
  contactSchema,
  contentKeys,
  heroSchema,
  logosSchema,
  processSchema,
  teamSchema,
  whyUsSchema,
  type AchievementsContent,
  type AnnouncementContent,
  type ContactContent,
  type HeroContent,
  type LogosContent,
  type ProcessContent,
  type TeamContent,
  type WhyUsContent,
} from "@/features/site-content/schemas";

/**
 * Content getters: DB (Setting) value when present and valid, seeded code
 * defaults otherwise — a missing or corrupt row can never blank a section.
 */

export const heroDefaults: HeroContent = {
  badge: "BFSI · Broking · FinTech recruitment specialists",
  headline: "Connecting the right talent,",
  headlineAccent: "with the right opportunity.",
  subtext:
    "Recruitment partners for banking, financial services, insurance, broking and FinTech companies that can't afford a slow hire — and careers for people who deserve a better one.",
  assurances: ["Free consultation", "Reply within 24 hours", "Zero fees for candidates"],
};

export const logosDefaults: LogosContent = { logos: [...clientLogos] };

export const processDefaults: ProcessContent = {
  steps: recruitmentProcess.map(({ title, body, duration, icon }) => ({
    title,
    body,
    duration,
    icon: icon as ProcessContent["steps"][number]["icon"],
  })),
};

export const whyUsDefaults: WhyUsContent = {
  cards: whyChooseUs.map(({ title, body, icon }) => ({
    title,
    body,
    icon: icon as WhyUsContent["cards"][number]["icon"],
  })),
};

async function readSetting<T>(key: string, schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }, fallback: T): Promise<T> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  const parsed = schema.safeParse(jsonValue<unknown>(row.value, null));
  return parsed.success && parsed.data ? parsed.data : fallback;
}

export const contactDefaults: ContactContent = {
  phone: siteConfig.phone,
  whatsapp: "+91 79770 25412",
  email: siteConfig.email,
  street: siteConfig.address.street,
  city: siteConfig.address.city,
  state: siteConfig.address.state,
  postalCode: siteConfig.address.postalCode,
  hours: siteConfig.hours,
  responseSla: siteConfig.responseSla,
  social: {
    linkedin: siteConfig.social.linkedin,
    twitter: siteConfig.social.twitter,
    instagram: siteConfig.social.instagram,
    facebook: siteConfig.social.facebook,
  },
};

export const announcementDefaults: AnnouncementContent = {
  enabled: false,
  text: "Hiring for BFSI, broking or FinTech? Tell us who you need.",
  linkLabel: "Request talent",
  href: "/employers#request-talent",
};

export const achievementsDefaults: AchievementsContent = { items: [...achievements] };

export const teamDefaults: TeamContent = {
  members: [
    {
      name: "Rohan Mehta",
      role: "Founder & CEO",
      bio: "Started Mavira Solutions after a decade in BFSI and broking hiring. Still personally reviews every client escalation.",
    },
    {
      name: "Kavita Iyer",
      role: "Head of Delivery",
      bio: "Runs the recruiting engine — 40+ specialist recruiters across six cities. Owner of the 3–5 day shortlist SLA and the dashboards that keep it honest.",
    },
    {
      name: "Sameer Bhat",
      role: "Executive Search Practice Lead",
      bio: "Closed 80+ CXO and VP searches across BFSI and manufacturing, including three confidential CFO transitions for listed companies.",
    },
    {
      name: "Nisha Reddy",
      role: "Head of Client Success",
      bio: "Keeps 500+ client relationships healthy — onboarding, QBRs and the 24-hour feedback loop that clients cite most in our reviews.",
    },
  ],
};

export const getHeroContent = cache(() => readSetting(contentKeys.hero, heroSchema, heroDefaults));
export const getClientLogos = cache(() => readSetting(contentKeys.logos, logosSchema, logosDefaults));
export const getProcessContent = cache(() => readSetting(contentKeys.process, processSchema, processDefaults));
export const getWhyUsContent = cache(() => readSetting(contentKeys.whyUs, whyUsSchema, whyUsDefaults));
export const getAnnouncement = cache(() => readSetting(contentKeys.announcement, announcementSchema, announcementDefaults));
export const getAchievements = cache(() => readSetting(contentKeys.achievements, achievementsSchema, achievementsDefaults));
export const getTeam = cache(() => readSetting(contentKeys.team, teamSchema, teamDefaults));

/** Contact details plus hrefs derived from the raw numbers. */
export const getContactContent = cache(async () => {
  const contact = await readSetting(contentKeys.contact, contactSchema, contactDefaults);
  const phoneDigits = contact.phone.replace(/[^\d+]/g, "");
  const whatsappDigits = contact.whatsapp.replace(/\D/g, "");
  return {
    ...contact,
    phoneHref: `tel:${phoneDigits}`,
    whatsappHref: `https://wa.me/${whatsappDigits}`,
  };
});
export type ResolvedContact = Awaited<ReturnType<typeof getContactContent>>;
