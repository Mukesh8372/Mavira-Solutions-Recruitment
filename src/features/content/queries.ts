import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { jsonValue } from "@/lib/utils";
import type { SiteStats } from "@/features/home/stats-band";

export const getApprovedTestimonials = cache(async (kind?: "CLIENT" | "CANDIDATE") => {
  return prisma.testimonial.findMany({
    where: { approved: true, ...(kind ? { kind } : {}) },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
});

export const getFeaturedTestimonials = cache(async (take = 6) => {
  return prisma.testimonial.findMany({
    where: { approved: true, featured: true },
    orderBy: { createdAt: "desc" },
    take,
  });
});

export const getSuccessStories = cache(async () => {
  return prisma.successStory.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } });
});

export const getSuccessStory = cache(async (slug: string) => {
  return prisma.successStory.findUnique({ where: { slug } });
});

export const getFaqs = cache(async (audience?: "EMPLOYER" | "CANDIDATE" | "GENERAL") => {
  return prisma.faqItem.findMany({
    where: audience ? { audience } : undefined,
    orderBy: { order: "asc" },
  });
});

const defaultStats: SiteStats & { offerJoinRate: number; avgShortlistDays: number } = {
  candidatesPlaced: 12000,
  clientCompanies: 500,
  yearsExperience: 15,
  googleRating: 4.9,
  offerJoinRate: 91,
  avgShortlistDays: 4,
};

export const getSiteStats = cache(async () => {
  const row = await prisma.setting.findUnique({ where: { key: "site-stats" } });
  if (!row) return defaultStats;
  return { ...defaultStats, ...jsonValue<Partial<typeof defaultStats>>(row.value, {}) };
});
