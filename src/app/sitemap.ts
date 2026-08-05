import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { servicesContent } from "@/content/services";
import { blogCategories } from "@/features/blog/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/employers`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/industries`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/why-choose-us`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/process`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/success-stories`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/testimonials`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ...servicesContent.map((s) => ({
      url: `${base}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...blogCategories.map((c) => ({
      url: `${base}/blog/category/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];

  const [posts, industries, stories] = await Promise.all([
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.industry.findMany({ select: { slug: true } }),
    prisma.successStory.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, createdAt: true } }),
  ]);

  return [
    ...staticRoutes,
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...industries.map((i) => ({ url: `${base}/industries/${i.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...stories.map((s) => ({ url: `${base}/success-stories/${s.slug}`, lastModified: s.createdAt, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
