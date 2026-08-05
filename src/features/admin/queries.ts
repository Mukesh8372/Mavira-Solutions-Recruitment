import "server-only";
import { prisma } from "@/lib/prisma";
import type { LeadStatus } from "@prisma/client";

/** Admin lists are capped at the 50 most recent rows — enough for daily ops without pagination. */
const PAGE_SIZE = 50;

export async function getAdminOverview() {
  const [
    newLeads,
    publishedPosts,
    draftPosts,
    subscribers,
    testimonials,
    pendingTestimonials,
    successStories,
    faqs,
    industries,
    recentLeads,
  ] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.count({ where: { status: "DRAFT" } }),
    prisma.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
    prisma.testimonial.count(),
    prisma.testimonial.count({ where: { approved: false } }),
    prisma.successStory.count({ where: { status: "PUBLISHED" } }),
    prisma.faqItem.count(),
    prisma.industry.count(),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  return {
    newLeads,
    publishedPosts,
    draftPosts,
    subscribers,
    testimonials,
    pendingTestimonials,
    successStories,
    faqs,
    industries,
    recentLeads,
  };
}

export async function getAdminLeads(status?: LeadStatus) {
  return prisma.lead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
}

export async function getAdminBlogPosts() {
  return prisma.blogPost.findMany({
    include: { author: true },
    orderBy: { updatedAt: "desc" },
    take: PAGE_SIZE,
  });
}

export async function getAdminBlogPost(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function getAdminTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
}

export async function getAdminSubscribers() {
  const [subscribers, activeCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: PAGE_SIZE }),
    prisma.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
  ]);
  return { subscribers, activeCount };
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    include: { employerProfile: true },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
}

export async function getAuditLogs() {
  return prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
