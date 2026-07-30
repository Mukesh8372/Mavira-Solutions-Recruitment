import "server-only";
import { prisma } from "@/lib/prisma";
import type { ApplicationStatus, JobStatus, LeadStatus } from "@prisma/client";

/** Admin lists are capped at the 50 most recent rows — enough for daily ops without pagination. */
const PAGE_SIZE = 50;

export async function getAdminOverview() {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [
    publishedJobs,
    draftJobs,
    applicationsTotal,
    applicationsThisWeek,
    candidates,
    companies,
    newLeads,
    unhandledQueries,
    subscribers,
    recentApplications,
    recentLeads,
  ] = await Promise.all([
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.job.count({ where: { status: "DRAFT" } }),
    prisma.application.count(),
    prisma.application.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.candidateProfile.count(),
    prisma.company.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.contactQuery.count({ where: { handled: false } }),
    prisma.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
    prisma.application.findMany({
      include: { candidate: { include: { user: true } }, job: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
  ]);
  return {
    publishedJobs,
    draftJobs,
    applicationsTotal,
    applicationsThisWeek,
    candidates,
    companies,
    newLeads,
    unhandledQueries,
    subscribers,
    recentApplications,
    recentLeads,
  };
}

export async function getAdminJobs(status?: JobStatus) {
  return prisma.job.findMany({
    where: status ? { status } : undefined,
    include: { company: true, department: true, _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
}

export async function getAdminApplications(status?: ApplicationStatus) {
  return prisma.application.findMany({
    where: status ? { status } : undefined,
    include: {
      candidate: { include: { user: true } },
      job: { include: { company: true } },
      resume: true,
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
}

export async function getAdminCandidates() {
  return prisma.candidateProfile.findMany({
    include: {
      user: true,
      _count: { select: { applications: true, resumes: true } },
    },
    orderBy: { user: { createdAt: "desc" } },
    take: PAGE_SIZE,
  });
}

export async function getAdminEmployers() {
  return prisma.company.findMany({
    include: {
      members: { include: { user: true } },
      _count: { select: { jobs: true } },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
}

export async function getAdminInterviews() {
  return prisma.interview.findMany({
    include: {
      application: {
        include: { job: { include: { company: true } }, candidate: { include: { user: true } } },
      },
    },
    orderBy: { scheduledAt: "desc" },
    take: PAGE_SIZE,
  });
}

export async function getAdminLeads(status?: LeadStatus) {
  return prisma.lead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });
}

export async function getAdminContactQueries(handled?: boolean) {
  return prisma.contactQuery.findMany({
    where: handled === undefined ? undefined : { handled },
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
