import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { ApplicationStatus, JobStatus } from "@prisma/client";

/** Employer profile + company for the signed-in user. Every employer query scopes to this companyId. */
export const getEmployerContext = cache(async (userId: string) => {
  return prisma.employerProfile.findUnique({
    where: { userId },
    include: { company: true, user: true },
  });
});

export async function getEmployerOverview(userId: string) {
  const ctx = await getEmployerContext(userId);
  if (!ctx) return null;
  const companyId = ctx.companyId;
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);

  const [jobStatusGroups, totalApplications, applicationsThisWeek, upcomingInterviewCount, recentApplications] =
    await Promise.all([
      prisma.job.groupBy({ by: ["status"], where: { companyId }, _count: { _all: true } }),
      prisma.application.count({ where: { job: { companyId } } }),
      prisma.application.count({ where: { job: { companyId }, createdAt: { gte: weekAgo } } }),
      prisma.interview.count({
        where: { application: { job: { companyId } }, status: "SCHEDULED", scheduledAt: { gte: new Date() } },
      }),
      prisma.application.findMany({
        where: { job: { companyId } },
        include: { job: true, candidate: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const jobCounts = {} as Record<JobStatus, number>;
  for (const g of jobStatusGroups) jobCounts[g.status] = g._count._all;

  return { profile: ctx, company: ctx.company, jobCounts, totalApplications, applicationsThisWeek, upcomingInterviewCount, recentApplications };
}

export async function getEmployerJobs(companyId: string) {
  return prisma.job.findMany({
    where: { companyId },
    include: { department: true, _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEmployerApplications(
  companyId: string,
  filters: { jobId?: string; status?: ApplicationStatus } = {}
) {
  return prisma.application.findMany({
    where: {
      job: { companyId },
      ...(filters.jobId ? { jobId: filters.jobId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: { candidate: { include: { user: true } }, resume: true, job: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEmployerInterviews(companyId: string) {
  return prisma.interview.findMany({
    where: { application: { job: { companyId } } },
    include: { application: { include: { job: true, candidate: { include: { user: true } } } } },
    orderBy: { scheduledAt: "desc" },
  });
}

export async function getEmployerReportData(companyId: string) {
  const [statusGroups, jobs] = await Promise.all([
    prisma.application.groupBy({ by: ["status"], where: { job: { companyId } }, _count: { _all: true } }),
    prisma.job.findMany({
      where: { companyId },
      include: { _count: { select: { applications: true } } },
      orderBy: [{ applications: { _count: "desc" } }, { createdAt: "desc" }],
    }),
  ]);
  const funnel = {} as Record<ApplicationStatus, number>;
  for (const g of statusGroups) funnel[g.status] = g._count._all;
  return { funnel, jobs };
}

export async function getDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } });
}
