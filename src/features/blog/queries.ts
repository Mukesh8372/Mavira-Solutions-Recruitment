import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const blogCategories = [
  { slug: "career-advice", name: "Career Advice", description: "Resumes, interviews, negotiation and growth — practical advice from our placement desk." },
  { slug: "hiring-insights", name: "Hiring Insights", description: "Playbooks, benchmarks and hard-won lessons for hiring teams." },
  { slug: "industry-news", name: "Industry News", description: "What's changing in India's talent market, without the noise." },
] as const;

export function getBlogCategory(slug: string) {
  return blogCategories.find((c) => c.slug === slug);
}

export const getPublishedPosts = cache(async (opts?: { category?: string; take?: number }) => {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED", ...(opts?.category ? { category: opts.category } : {}) },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { publishedAt: "desc" },
    ...(opts?.take ? { take: opts.take } : {}),
  });
});

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { name: true, image: true } } },
  });
});

export async function getRelatedPosts(post: { id: string; category: string }, take = 3) {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED", category: post.category, id: { not: post.id } },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { publishedAt: "desc" },
    take,
  });
}
