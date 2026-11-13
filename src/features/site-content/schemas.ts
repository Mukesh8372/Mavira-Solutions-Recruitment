import { z } from "zod";

/**
 * Typed slots for admin-editable site content.
 * Every schema is deliberately constrained (lengths, fixed counts, icon picklist)
 * so the design can never be broken from the admin panel.
 */

export const contentIconOptions = [
  "target", "gauge", "eye", "shield-check", "messages-square", "search", "list-checks", "handshake",
  "user-check", "users", "users-round", "briefcase-business", "graduation-cap", "wallet", "crown",
  "file-clock", "heart-pulse", "truck", "factory", "monitor", "headset", "pen-tool", "landmark", "building",
] as const;

const icon = z.enum(contentIconOptions);

export const heroSchema = z.object({
  badge: z.string().trim().min(3).max(60, "Badge must be under 60 characters"),
  headline: z.string().trim().min(3).max(40, "Headline must be under 40 characters"),
  headlineAccent: z.string().trim().min(1).max(20, "Accent word must be under 20 characters"),
  subtext: z.string().trim().min(10).max(180, "Subtext must be under 180 characters"),
  assurances: z.array(z.string().trim().min(2).max(32)).length(3, "Exactly 3 assurance items"),
});
export type HeroContent = z.infer<typeof heroSchema>;

export const statsSchema = z.object({
  candidatesPlaced: z.coerce.number().int().min(0).max(10_000_000),
  clientCompanies: z.coerce.number().int().min(0).max(1_000_000),
  yearsExperience: z.coerce.number().int().min(0).max(100),
  googleRating: z.coerce.number().min(0).max(5),
  offerJoinRate: z.coerce.number().int().min(0).max(100),
  avgShortlistDays: z.coerce.number().int().min(1).max(60),
});
export type SiteStatsContent = z.infer<typeof statsSchema>;

export const logosSchema = z.object({
  logos: z
    .array(z.string().trim().min(1).max(24, "Each name must be under 24 characters"))
    .min(4, "At least 4 names")
    .max(20, "At most 20 names"),
});
export type LogosContent = z.infer<typeof logosSchema>;

export const processStepSchema = z.object({
  title: z.string().trim().min(3).max(40),
  body: z.string().trim().min(10).max(320),
  duration: z.string().trim().min(2).max(20),
  icon,
});
export const processSchema = z.object({
  steps: z.array(processStepSchema).length(4, "The process is always 4 steps"),
});
export type ProcessContent = z.infer<typeof processSchema>;

export const whyUsCardSchema = z.object({
  title: z.string().trim().min(3).max(48),
  body: z.string().trim().min(10).max(280),
  icon,
});
export const whyUsSchema = z.object({
  cards: z.array(whyUsCardSchema).length(4, "Always 4 differentiator cards"),
});
export type WhyUsContent = z.infer<typeof whyUsSchema>;

export const faqSchema = z.object({
  question: z.string().trim().min(8, "Question is too short").max(160),
  answer: z.string().trim().min(20, "Answer is too short").max(1200),
  audience: z.enum(["EMPLOYER", "CANDIDATE", "GENERAL"]),
  order: z.coerce.number().int().min(0).max(999),
});
export type FaqInput = z.infer<typeof faqSchema>;

export const industrySchema = z.object({
  name: z.string().trim().min(2, "Enter the industry name (at least 2 characters)").max(48, "Keep the name under 48 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Write a description of at least 10 characters")
    .max(200, "Keep the description under 200 characters"),
  icon,
});
export type IndustryInput = z.infer<typeof industrySchema>;

const socialUrl = z.string().trim().url("Enter a full URL (https://…)").max(200);

export const contactSchema = z.object({
  phone: z.string().trim().min(8, "Enter the display phone number").max(20),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{8,16}$/, "Digits only, e.g. +91 98765 00000"),
  email: z.string().trim().email("Enter a valid email"),
  street: z.string().trim().min(4).max(80),
  city: z.string().trim().min(2).max(40),
  state: z.string().trim().min(2).max(40),
  postalCode: z.string().trim().min(4).max(10),
  hours: z.string().trim().min(4).max(80),
  responseSla: z.string().trim().min(4).max(80),
  social: z.object({
    linkedin: socialUrl,
    twitter: socialUrl,
    instagram: socialUrl,
    facebook: socialUrl,
  }),
});
export type ContactContent = z.infer<typeof contactSchema>;

export const announcementSchema = z
  .object({
    enabled: z.boolean(),
    text: z.string().trim().min(8, "Announcement text is too short").max(120),
    linkLabel: z.string().trim().max(30).optional().or(z.literal("")),
    href: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .refine((v) => !v.href || v.href.startsWith("/") || v.href.startsWith("https://"), {
    message: "Link must be a site path (/jobs) or a full https:// URL",
    path: ["href"],
  })
  .refine((v) => !v.href || !!v.linkLabel, {
    message: "Add a label for the link",
    path: ["linkLabel"],
  });
export type AnnouncementContent = z.infer<typeof announcementSchema>;

export const achievementsSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string().trim().min(3).max(60),
        org: z.string().trim().min(2).max(48),
        year: z.string().trim().regex(/^\d{4}$/, "Year must be 4 digits, e.g. 2024"),
      })
    )
    .min(1, "At least 1 achievement")
    .max(8, "At most 8 achievements"),
});
export type AchievementsContent = z.infer<typeof achievementsSchema>;

export const teamSchema = z.object({
  members: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(40),
        role: z.string().trim().min(2).max(48),
        bio: z.string().trim().min(20, "Bio is too short").max(220),
      })
    )
    .min(2, "At least 2 team members")
    .max(8, "At most 8 team members"),
});
export type TeamContent = z.infer<typeof teamSchema>;

export const successStorySchema = z.object({
  title: z.string().trim().min(8, "Title is too short").max(90),
  clientName: z.string().trim().min(2).max(48),
  industry: z.string().trim().min(2).max(32),
  challenge: z.string().trim().min(20, "Describe the challenge").max(500),
  solution: z.string().trim().min(20, "Describe the solution").max(600),
  results: z.array(z.string().trim().min(4).max(120)).min(1, "Add at least 1 result").max(6),
  metrics: z
    .array(
      z.object({
        label: z.string().trim().min(2).max(40),
        value: z.string().trim().min(1).max(16),
      })
    )
    .min(1)
    .max(4),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});
export type SuccessStoryInput = z.infer<typeof successStorySchema>;


/** Setting-table keys for each content block. */
export const contentKeys = {
  hero: "hero",
  stats: "site-stats",
  logos: "client-logos",
  process: "process-steps",
  whyUs: "why-us",
  contact: "contact-details",
  announcement: "announcement-bar",
  achievements: "achievements",
  team: "leadership-team",
} as const;
