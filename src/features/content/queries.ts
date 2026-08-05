import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

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

export const getIndustries = cache(async () => {
  return prisma.industry.findMany({ orderBy: { name: "asc" } });
});

export const getIndustryBySlug = cache(async (slug: string) => {
  return prisma.industry.findUnique({ where: { slug } });
});
