import "server-only";
import { prisma } from "@/lib/prisma";
import type { JobStatus, LeadStatus, Prisma } from "@prisma/client";
import { openJobWhere } from "@/features/jobs/queries";
import { dateOfBirthForAge } from "@/features/jobs/options";
import { istDayEnd, istDayStart } from "@/features/jobs/admin-schemas";
import { APPLICATIONS_PER_PAGE, type ApplicantFilters } from "@/features/jobs/applicant-filters";

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
    openJobs,
    newApplications,
    openIncidents,
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
    prisma.job.count({ where: openJobWhere() }),
    prisma.jobApplication.count({ where: { status: "APPLIED" } }),
    prisma.systemIncident.count({ where: { resolvedAt: null } }),
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
    openJobs,
    newApplications,
    openIncidents,
  };
}

/* ------------------------------------------------------------------ Jobs */

export async function getAdminJobs(status?: JobStatus) {
  return prisma.job.findMany({
    where: status ? { status } : undefined,
    include: { company: true, department: true, _count: { select: { publicApplications: true } } },
    orderBy: { updatedAt: "desc" },
    take: PAGE_SIZE,
  });
}

export async function getAdminJob(id: string) {
  return prisma.job.findUnique({ where: { id }, include: { company: true, department: true } });
}

/** Dropdown data for the job form. */
export async function getJobOptions() {
  const [departments, industries, clients] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.industry.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { departments, industries, clients };
}

/** Jobs with at least one application, for the applications filter. */
export async function getApplicationJobOptions() {
  return prisma.job.findMany({
    where: { publicApplications: { some: {} } },
    orderBy: { title: "asc" },
    select: { id: true, title: true, location: true },
  });
}

/* ---------------------------------------------------------- Applications */

export async function getAdminApplications(f: ApplicantFilters) {
  const today = new Date();
  const and: Prisma.JobApplicationWhereInput[] = [];

  if (f.job) and.push({ jobId: f.job });
  if (f.category) and.push({ job: { departmentId: f.category } });
  if (f.status) and.push({ status: f.status });
  // Age N or older  => born on or before (today - N years).
  if (f.ageMin !== undefined) and.push({ dateOfBirth: { lte: dateOfBirthForAge(f.ageMin, today) } });
  // Age N or younger => born after (today - (N+1) years).
  if (f.ageMax !== undefined) and.push({ dateOfBirth: { gt: dateOfBirthForAge(f.ageMax + 1, today) } });
  if (f.expMin !== undefined) and.push({ experienceYears: { gte: f.expMin } });
  if (f.expMax !== undefined) and.push({ experienceYears: { lte: f.expMax } });
  if (f.ctcMin !== undefined) and.push({ expectedCtcLpa: { gte: f.ctcMin } });
  if (f.ctcMax !== undefined) and.push({ expectedCtcLpa: { lte: f.ctcMax } });
  if (f.city) and.push({ currentCity: f.city });
  if (f.qualification) and.push({ qualification: f.qualification });
  if (f.notice !== undefined) and.push({ noticePeriodDays: f.notice });
  const from = f.from ? istDayStart(f.from) : null;
  const to = f.to ? istDayEnd(f.to) : null;
  if (from) and.push({ createdAt: { gte: from } });
  if (to) and.push({ createdAt: { lte: to } });
  if (f.q) {
    const q = f.q;
    and.push({
      OR: [
        { applicantName: { contains: q, mode: "insensitive" } },
        { applicantEmail: { contains: q, mode: "insensitive" } },
        { applicantPhone: { contains: q.replace(/[\s-]/g, "") } },
        { currentCompany: { contains: q, mode: "insensitive" } },
        { currentDesignation: { contains: q, mode: "insensitive" } },
        { skills: { string_contains: q, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.JobApplicationWhereInput = and.length ? { AND: and } : {};
  const orderBy: Prisma.JobApplicationOrderByWithRelationInput[] =
    f.sort === "oldest" ? [{ createdAt: "asc" }] : f.sort === "experience" ? [{ experienceYears: "desc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }];

  const total = await prisma.jobApplication.count({ where });
  const pages = Math.max(1, Math.ceil(total / APPLICATIONS_PER_PAGE));
  const page = Math.min(f.page, pages);
  const rows = await prisma.jobApplication.findMany({
    where,
    orderBy,
    skip: (page - 1) * APPLICATIONS_PER_PAGE,
    take: APPLICATIONS_PER_PAGE,
    include: {
      job: { select: { id: true, title: true, slug: true, location: true, confidential: true, confidentialLabel: true, company: { select: { name: true } }, department: { select: { name: true } } } },
    },
  });
  return { rows, total, page, pages };
}

/* ---------------------------------------------------------------- Clients */

export async function getAdminClients() {
  return prisma.company.findMany({
    include: { _count: { select: { jobs: true } } },
    orderBy: { name: "asc" },
    take: 200,
  });
}

/* -------------------------------------------------------------- Incidents */

export async function getOpenIncidents() {
  return prisma.systemIncident.findMany({ where: { resolvedAt: null }, orderBy: { createdAt: "desc" }, take: 20 });
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
