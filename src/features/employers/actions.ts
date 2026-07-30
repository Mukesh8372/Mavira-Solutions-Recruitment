"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, shortId } from "@/lib/utils";
import { labelApplicationStatus } from "@/lib/format";
import {
  jobSchema,
  interviewSchema,
  companySchema,
  EMPLOYER_STATUS_TARGETS,
  type JobInput,
  type InterviewInput,
  type CompanyInput,
} from "@/features/employers/schemas";

export type EmployerActionResult = { ok: true; message?: string } | { ok: false; error: string };

/** Re-verify EMPLOYER role + resolve the profile/company on every action (defense in depth). */
async function requireEmployer() {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") return null;
  const profile = await prisma.employerProfile.findUnique({ where: { userId: session.user.id } });
  return profile ? { session, profile } : null;
}

/** Split a textarea into one item per non-empty line. */
function lines(value?: string): string[] {
  return (value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function saveJob(input: JobInput): Promise<EmployerActionResult> {
  const ctx = await requireEmployer();
  if (!ctx) return { ok: false, error: "You need to be signed in as an employer." };

  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const department = await prisma.department.findUnique({ where: { id: d.departmentId } });
  if (!department) return { ok: false, error: "Pick a valid department." };

  const skills = (d.skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

  const data = {
    title: d.title,
    departmentId: d.departmentId,
    location: d.location,
    workMode: d.workMode,
    employmentType: d.employmentType,
    experienceMin: d.experienceMin,
    experienceMax: d.experienceMax,
    salaryMin: d.salaryMin ?? null,
    salaryMax: d.salaryMax ?? null,
    salaryVisible: d.salaryVisible,
    description: d.description,
    responsibilities: JSON.stringify(lines(d.responsibilities)),
    requirements: JSON.stringify(lines(d.requirements)),
    benefits: JSON.stringify(lines(d.benefits)),
    skills: JSON.stringify(skills),
    urgent: d.urgent,
  };

  if (d.id) {
    const existing = await prisma.job.findUnique({ where: { id: d.id } });
    if (!existing || existing.companyId !== ctx.profile.companyId) return { ok: false, error: "Job not found." };
    // Status untouched: a PUBLISHED job stays published, a DRAFT stays in review.
    await prisma.job.update({ where: { id: existing.id }, data });
    revalidatePath("/employer/jobs");
    revalidatePath("/employer");
    if (existing.status === "PUBLISHED") {
      revalidatePath("/jobs");
      revalidatePath(`/jobs/${existing.slug}`);
    }
    return { ok: true, message: "Job updated" };
  }

  await prisma.job.create({
    data: {
      ...data,
      slug: `${slugify(`${d.title}-${d.location}`)}-${shortId()}`,
      status: "DRAFT",
      companyId: ctx.profile.companyId,
      postedById: ctx.session.user.id,
    },
  });
  revalidatePath("/employer/jobs");
  revalidatePath("/employer");
  return { ok: true, message: "Job submitted for review — it goes live once our team approves it." };
}

export async function closeJob(jobId: string): Promise<EmployerActionResult> {
  const ctx = await requireEmployer();
  if (!ctx) return { ok: false, error: "You need to be signed in as an employer." };

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.companyId !== ctx.profile.companyId) return { ok: false, error: "Job not found." };
  if (job.status === "CLOSED" || job.status === "ARCHIVED") return { ok: false, error: "This job is already closed." };

  await prisma.job.update({ where: { id: job.id }, data: { status: "CLOSED" } });
  revalidatePath("/employer/jobs");
  revalidatePath("/employer");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${job.slug}`);
  return { ok: true, message: "Job closed" };
}

const statusTargetSchema = z.enum(EMPLOYER_STATUS_TARGETS);

export async function updateApplicationStatus(applicationId: string, status: string): Promise<EmployerActionResult> {
  const ctx = await requireEmployer();
  if (!ctx) return { ok: false, error: "You need to be signed in as an employer." };

  const parsed = statusTargetSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "That status change isn't allowed." };

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true, candidate: true },
  });
  if (!application || application.job.companyId !== ctx.profile.companyId) {
    return { ok: false, error: "Application not found." };
  }
  if (application.status === "WITHDRAWN") {
    return { ok: false, error: "The candidate withdrew this application — its status can't be changed." };
  }
  if (application.status === parsed.data) return { ok: true, message: "Status unchanged" };

  const history = JSON.parse((application.statusHistory as string) || "[]") as unknown[];
  await prisma.application.update({
    where: { id: application.id },
    data: {
      status: parsed.data,
      statusHistory: JSON.stringify([...history, { status: parsed.data, at: new Date().toISOString() }]),
    },
  });
  await prisma.notification.create({
    data: {
      userId: application.candidate.userId,
      type: "application-status",
      title: `Update on ${application.job.title}`,
      body: `Your application is now marked "${labelApplicationStatus(parsed.data)}".`,
      link: "/dashboard/applications",
    },
  });

  revalidatePath("/employer/applications");
  revalidatePath("/employer/reports");
  revalidatePath("/employer");
  return { ok: true, message: `Moved to ${labelApplicationStatus(parsed.data)}` };
}

export async function scheduleInterview(input: InterviewInput): Promise<EmployerActionResult> {
  const ctx = await requireEmployer();
  if (!ctx) return { ok: false, error: "You need to be signed in as an employer." };

  const parsed = interviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id: d.applicationId },
    include: { job: true, candidate: true },
  });
  if (!application || application.job.companyId !== ctx.profile.companyId) {
    return { ok: false, error: "Application not found." };
  }
  if (application.status === "WITHDRAWN") {
    return { ok: false, error: "The candidate withdrew this application — you can't schedule an interview." };
  }

  const scheduledAt = new Date(d.scheduledAt);
  await prisma.interview.create({
    data: {
      applicationId: application.id,
      scheduledAt,
      mode: d.mode,
      meetingUrl: d.meetingUrl || null,
      location: d.location || null,
      interviewer: d.interviewer || null,
    },
  });

  if (application.status !== "INTERVIEW") {
    const history = JSON.parse((application.statusHistory as string) || "[]") as unknown[];
    await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "INTERVIEW",
        statusHistory: JSON.stringify([...history, { status: "INTERVIEW", at: new Date().toISOString() }]),
      },
    });
  }
  await prisma.notification.create({
    data: {
      userId: application.candidate.userId,
      type: "application-status",
      title: `Update on ${application.job.title}`,
      body: "An interview has been scheduled — check your dashboard for the time and joining details.",
      link: "/dashboard/interviews",
    },
  });

  revalidatePath("/employer/interviews");
  revalidatePath("/employer/applications");
  revalidatePath("/employer");
  return { ok: true, message: "Interview scheduled" };
}

export async function updateCompanyProfile(input: CompanyInput): Promise<EmployerActionResult> {
  const ctx = await requireEmployer();
  if (!ctx) return { ok: false, error: "You need to be signed in as an employer." };

  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.company.update({
    where: { id: ctx.profile.companyId },
    data: {
      about: parsed.data.about || null,
      website: parsed.data.website || null,
      size: parsed.data.size || null,
      industry: parsed.data.industry || null,
    },
  });
  revalidatePath("/employer/company");
  revalidatePath("/employer");
  return { ok: true, message: "Company profile updated" };
}
