import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma, WorkMode, EmploymentType } from "@prisma/client";

export const JOBS_PER_PAGE = 10;

export type JobFilters = {
  q?: string;
  location?: string;
  department?: string;
  experience?: string; // "0-1" | "1-3" | "3-5" | "5-8" | "8-99"
  salaryMin?: number; // LPA
  type?: EmploymentType[];
  mode?: WorkMode[];
  sort?: "newest" | "salary" | "relevance";
  page?: number;
};

export const jobInclude = { company: true, department: true, industry: true } satisfies Prisma.JobInclude;
export type JobWithRelations = Prisma.JobGetPayload<{ include: typeof jobInclude }>;

function buildWhere(filters: JobFilters): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { status: "PUBLISHED" };
  const and: Prisma.JobWhereInput[] = [];

  if (filters.q) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
        { company: { name: { contains: q } } },
      ],
    });
  }
  if (filters.location) and.push({ location: { contains: filters.location.trim() } });
  if (filters.department) and.push({ department: { slug: filters.department } });
  if (filters.experience) {
    const [min, max] = filters.experience.split("-").map(Number);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      and.push({ experienceMin: { lte: max }, experienceMax: { gte: min } });
    }
  }
  if (filters.salaryMin) and.push({ salaryMax: { gte: filters.salaryMin * 100_000 } });
  if (filters.type?.length) and.push({ employmentType: { in: filters.type } });
  if (filters.mode?.length) and.push({ workMode: { in: filters.mode } });

  return and.length ? { ...where, AND: and } : where;
}

export async function searchJobs(filters: JobFilters) {
  const where = buildWhere(filters);
  const page = Math.max(1, filters.page ?? 1);
  const orderBy: Prisma.JobOrderByWithRelationInput[] =
    filters.sort === "salary"
      ? [{ salaryMax: "desc" }]
      : filters.sort === "relevance" && filters.q
        ? [{ featured: "desc" }, { publishedAt: "desc" }]
        : [{ publishedAt: "desc" }];

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: jobInclude,
      orderBy,
      skip: (page - 1) * JOBS_PER_PAGE,
      take: JOBS_PER_PAGE,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, totalPages: Math.max(1, Math.ceil(total / JOBS_PER_PAGE)) };
}

export const getFeaturedJobs = cache(async (take = 6) => {
  return prisma.job.findMany({
    where: { status: "PUBLISHED", featured: true },
    include: jobInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
});

export const getLatestJobs = cache(async (take = 4) => {
  return prisma.job.findMany({
    where: { status: "PUBLISHED" },
    include: jobInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
});

export const getJobBySlug = cache(async (slug: string) => {
  return prisma.job.findUnique({ where: { slug }, include: jobInclude });
});

export async function getRelatedJobs(job: { id: string; departmentId: string }, take = 4) {
  return prisma.job.findMany({
    where: { status: "PUBLISHED", departmentId: job.departmentId, id: { not: job.id } },
    include: jobInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export const getDepartments = cache(async () => {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { jobs: { where: { status: "PUBLISHED" } } } } },
  });
});

export const getIndustries = cache(async () => {
  return prisma.industry.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { jobs: { where: { status: "PUBLISHED" } } } } },
  });
});

export const getDepartmentBySlug = cache(async (slug: string) => {
  return prisma.department.findUnique({ where: { slug } });
});

export const getIndustryBySlug = cache(async (slug: string) => {
  return prisma.industry.findUnique({ where: { slug } });
});

export async function getJobsByDepartment(departmentSlug: string, take = 20) {
  return prisma.job.findMany({
    where: { status: "PUBLISHED", department: { slug: departmentSlug } },
    include: jobInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export async function getJobsByIndustry(industrySlug: string, take = 20) {
  return prisma.job.findMany({
    where: { status: "PUBLISHED", industry: { slug: industrySlug } },
    include: jobInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export const getJobLocations = cache(async () => {
  const rows = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    select: { location: true },
    distinct: ["location"],
    orderBy: { location: "asc" },
  });
  return rows.map((r) => r.location);
});
