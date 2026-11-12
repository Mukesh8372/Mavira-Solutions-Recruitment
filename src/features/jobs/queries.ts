import "server-only";

import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EXPERIENCE_OPTIONS, JOBS_PER_PAGE, type JobFilters } from "@/features/jobs/display";

export const jobInclude = { company: true, department: true, industry: true } satisfies Prisma.JobInclude;
export type JobWithRelations = Prisma.JobGetPayload<{ include: typeof jobInclude }>;

/** Jobs that accept applications: PUBLISHED and not past their apply-by date. */
export function openJobWhere(now = new Date()): Prisma.JobWhereInput {
  return { status: "PUBLISHED", OR: [{ validThrough: null }, { validThrough: { gt: now } }] };
}

const insensitive = (value: string): Prisma.StringFilter => ({ contains: value, mode: "insensitive" });

function buildWhere(filters: JobFilters, now: Date): Prisma.JobWhereInput {
  const and: Prisma.JobWhereInput[] = [openJobWhere(now)];

  if (filters.q) {
    and.push({
      OR: [
        { title: insensitive(filters.q) },
        { description: insensitive(filters.q) },
        { location: insensitive(filters.q) },
        // Never match a hidden client name.
        { confidential: false, company: { name: insensitive(filters.q) } },
      ],
    });
  }
  if (filters.location) and.push({ location: insensitive(filters.location) });
  if (filters.category) and.push({ department: { slug: filters.category } });
  if (filters.industry) and.push({ industry: { slug: filters.industry } });
  if (filters.experience) {
    const band = EXPERIENCE_OPTIONS.find((o) => o.value === filters.experience);
    if (band) and.push({ experienceMin: { lte: band.max }, experienceMax: { gte: band.min } });
  }
  if (filters.type.length) and.push({ employmentType: { in: filters.type } });
  if (filters.mode.length) and.push({ workMode: { in: filters.mode } });

  return { AND: and };
}

export async function searchJobs(filters: JobFilters) {
  const now = new Date();
  const where = buildWhere(filters, now);
  const orderBy: Prisma.JobOrderByWithRelationInput[] =
    filters.sort === "salary"
      ? [{ salaryMax: { sort: "desc", nulls: "last" } }, { publishedAt: "desc" }]
      : [{ featured: "desc" }, { publishedAt: "desc" }];

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: jobInclude,
      orderBy,
      skip: (filters.page - 1) * JOBS_PER_PAGE,
      take: JOBS_PER_PAGE,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page: filters.page, totalPages: Math.max(1, Math.ceil(total / JOBS_PER_PAGE)) };
}

export const getLatestJobs = cache(async (take = 6) => {
  return prisma.job.findMany({
    where: openJobWhere(),
    include: jobInclude,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take,
  });
});

/** Any status: the page decides what to show (404 for DRAFT/ARCHIVED, a closed banner otherwise). */
export const getJobBySlug = cache(async (slug: string) => {
  return prisma.job.findUnique({ where: { slug }, include: jobInclude });
});

/** The apply action uses this: null unless the job accepts applications right now. */
export async function getOpenJobById(id: string) {
  return prisma.job.findFirst({ where: { id, ...openJobWhere() }, select: { id: true, slug: true, title: true } });
}

export async function getRelatedJobs(job: { id: string; departmentId: string }, take = 4) {
  return prisma.job.findMany({
    where: { ...openJobWhere(), departmentId: job.departmentId, id: { not: job.id } },
    include: jobInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

/** Role categories with their open-job counts. */
export const getDepartments = cache(async () => {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { jobs: { where: openJobWhere() } } } },
  });
});

export const getDepartmentBySlug = cache(async (slug: string) => {
  return prisma.department.findUnique({ where: { slug } });
});

export async function getJobsByDepartment(departmentSlug: string, take = 30) {
  return prisma.job.findMany({
    where: { ...openJobWhere(), department: { slug: departmentSlug } },
    include: jobInclude,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take,
  });
}

export async function getJobsByIndustry(industrySlug: string, take = 6) {
  return prisma.job.findMany({
    where: { ...openJobWhere(), industry: { slug: industrySlug } },
    include: jobInclude,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take,
  });
}

export const getJobLocations = cache(async () => {
  const rows = await prisma.job.findMany({
    where: openJobWhere(),
    select: { location: true },
    distinct: ["location"],
    orderBy: { location: "asc" },
  });
  return rows.map((r) => r.location);
});
