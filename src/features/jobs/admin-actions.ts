"use server";

import { revalidatePath } from "next/cache";
import type { JobStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { shortId, slugify } from "@/lib/utils";
import { deleteResumeQuietly } from "@/lib/resume-storage";
import { revalidateJobPages } from "@/features/jobs/cache";
import {
  adminNoteSchema,
  applicationStatusSchema,
  canTransitionJob,
  istDayEnd,
  jobSchema,
  jobStatusSchema,
} from "@/features/jobs/admin-schemas";

export type AdminJobResult = { ok: true; message?: string; id?: string } | { ok: false; error: string; field?: string };

const notStaff = { ok: false, error: "You need admin or staff access for this." } as const;

async function requireStaff() {
  return requireRole(["ADMIN", "STAFF"]);
}

function firstIssue(error: { issues: { message: string; path: PropertyKey[] }[] }): { error: string; field?: string } {
  const issue = error.issues[0];
  return { error: issue?.message ?? "Invalid input", field: typeof issue?.path[0] === "string" ? issue.path[0] : undefined };
}

const lpaToInr = (lpa: number | undefined) => (lpa === undefined ? null : Math.round(lpa * 100_000));

/* ------------------------------------------------------------------ Jobs */

export async function saveJob(input: unknown, id?: string): Promise<AdminJobResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) return { ok: false, ...firstIssue(parsed.error) };
  const d = parsed.data;

  const existing = id ? await prisma.job.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, error: "Job not found." };

  const [department, industry] = await Promise.all([
    prisma.department.findUnique({ where: { id: d.departmentId }, select: { id: true } }),
    d.industryId ? prisma.industry.findUnique({ where: { id: d.industryId }, select: { id: true } }) : null,
  ]);
  if (!department) return { ok: false, error: "Choose a role category.", field: "departmentId" };
  if (d.industryId && !industry) return { ok: false, error: "That industry no longer exists.", field: "industryId" };

  // Status: the form offers DRAFT and PUBLISHED. A CLOSED or ARCHIVED job keeps its status
  // unless the requested move is an allowed transition.
  let status: JobStatus = d.status;
  if (existing && existing.status !== d.status && !canTransitionJob(existing.status, d.status)) {
    if (existing.status === "CLOSED" || existing.status === "ARCHIVED") status = existing.status;
    else return { ok: false, error: `A ${existing.status.toLowerCase()} job can't move to ${d.status.toLowerCase()}.`, field: "status" };
  }

  const validThrough = d.validThrough ? istDayEnd(d.validThrough) : null;
  const now = new Date();

  const data = {
    title: d.title,
    departmentId: d.departmentId,
    industryId: d.industryId ?? null,
    employerLabel: d.employerLabel,
    location: d.location,
    workMode: d.workMode,
    employmentType: d.employmentType,
    experienceMin: d.experienceMin,
    experienceMax: d.experienceMax,
    salaryMin: lpaToInr(d.salaryMinLpa),
    salaryMax: lpaToInr(d.salaryMaxLpa),
    salaryVisible: d.salaryVisible,
    featured: d.featured,
    urgent: d.urgent,
    validThrough,
    description: d.description,
    responsibilities: JSON.stringify(d.responsibilities),
    requirements: JSON.stringify(d.requirements),
    benefits: JSON.stringify(d.benefits),
    skills: JSON.stringify(d.skills),
    seoTitle: d.seoTitle ?? null,
    seoDescription: d.seoDescription ?? null,
    status,
  };

  const jobId = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.job.update({
        where: { id: existing.id },
        data: {
          ...data,
          // Set on the first publish only; the slug never changes on edit.
          publishedAt: status === "PUBLISHED" ? (existing.publishedAt ?? now) : existing.publishedAt,
        },
      });
      return existing.id;
    }

    let slug = slugify(`${d.title}-${d.location}`);
    if (!slug) slug = `job-${shortId(6)}`;
    if (await tx.job.findUnique({ where: { slug } })) slug = `${slug.slice(0, 55)}-${shortId()}`;
    const created = await tx.job.create({
      data: { ...data, slug, postedById: session.user.id, publishedAt: status === "PUBLISHED" ? now : null },
    });
    return created.id;
  });

  await audit(session.user.id, existing ? "job.update" : "job.create", "Job", jobId, { status });
  revalidateJobPages();
  return { ok: true, id: jobId, message: existing ? "Job saved" : status === "PUBLISHED" ? "Job published" : "Job saved as draft" };
}

export async function setJobStatus(id: string, target: string): Promise<AdminJobResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const parsed = jobStatusSchema.safeParse(target);
  if (!parsed.success) return { ok: false, error: "Invalid status." };

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return { ok: false, error: "Job not found." };
  if (job.status === parsed.data) return { ok: true, message: "Status unchanged." };
  if (!canTransitionJob(job.status, parsed.data)) {
    return { ok: false, error: `A ${job.status.toLowerCase()} job can't move to ${parsed.data.toLowerCase()}.` };
  }
  if (parsed.data === "PUBLISHED" && job.validThrough && job.validThrough.getTime() <= Date.now()) {
    return { ok: false, error: "The apply-by date has passed. Extend it in the job form first." };
  }

  await prisma.job.update({
    where: { id },
    data: { status: parsed.data, publishedAt: parsed.data === "PUBLISHED" ? (job.publishedAt ?? new Date()) : job.publishedAt },
  });
  await audit(session.user.id, "job.status", "Job", id, { from: job.status, to: parsed.data });
  revalidateJobPages();
  const labels: Record<JobStatus, string> = { DRAFT: "Moved to draft", PUBLISHED: "Job published", CLOSED: "Job closed", ARCHIVED: "Job archived" };
  return { ok: true, message: labels[parsed.data] };
}

export async function updateJobFlags(id: string, flags: { featured?: boolean; urgent?: boolean }): Promise<AdminJobResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const job = await prisma.job.findUnique({ where: { id }, select: { id: true, featured: true, urgent: true } });
  if (!job) return { ok: false, error: "Job not found." };
  const data = {
    ...(typeof flags.featured === "boolean" ? { featured: flags.featured } : {}),
    ...(typeof flags.urgent === "boolean" ? { urgent: flags.urgent } : {}),
  };
  if (Object.keys(data).length === 0) return { ok: true, message: "Nothing to change." };
  await prisma.job.update({ where: { id }, data });
  await audit(session.user.id, "job.flags", "Job", id, { from: { featured: job.featured, urgent: job.urgent }, to: data });
  revalidateJobPages();
  return { ok: true, message: "Job updated" };
}

/* ---------------------------------------------------------- Applications */

function revalidateApplicationPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/admin/jobs");
}

export async function updateApplicationStatus(id: string, status: string): Promise<AdminJobResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const parsed = applicationStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid application status." };

  const application = await prisma.jobApplication.findUnique({ where: { id }, select: { id: true, status: true, statusHistory: true } });
  if (!application) return { ok: false, error: "Application not found." };
  if (application.status === parsed.data) return { ok: true, message: "Status unchanged." };

  const history = jsonHistory(application.statusHistory);
  history.push({ status: parsed.data, at: new Date().toISOString(), by: session.user.id });
  await prisma.jobApplication.update({ where: { id }, data: { status: parsed.data, statusHistory: JSON.stringify(history) } });
  await audit(session.user.id, "application.status", "JobApplication", id, { from: application.status, to: parsed.data });
  revalidateApplicationPages();
  return { ok: true, message: "Application updated" };
}

type HistoryEntry = { status: string; at: string; by?: string };
function jsonHistory(value: unknown): HistoryEntry[] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.filter((e) => e && typeof e.status === "string" && typeof e.at === "string") : [];
  } catch {
    return [];
  }
}

export async function saveApplicationNote(id: string, note: string): Promise<AdminJobResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const parsed = adminNoteSchema.safeParse(note);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid note" };
  const application = await prisma.jobApplication.findUnique({ where: { id }, select: { id: true } });
  if (!application) return { ok: false, error: "Application not found." };
  await prisma.jobApplication.update({ where: { id }, data: { adminNote: parsed.data || null } });
  await audit(session.user.id, "application.note", "JobApplication", id, { length: parsed.data.length });
  revalidateApplicationPages();
  return { ok: true, message: "Note saved" };
}

/** Removes the application row and its resume file. The audit row holds ids only, never applicant data. */
export async function deleteApplication(id: string): Promise<AdminJobResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const application = await prisma.jobApplication.findUnique({ where: { id }, select: { id: true, jobId: true, resumeKey: true } });
  if (!application) return { ok: false, error: "Application not found." };

  await prisma.jobApplication.delete({ where: { id } });
  await deleteResumeQuietly(application.resumeKey, { applicationId: id });
  await audit(session.user.id, "application.delete", "JobApplication", id, { jobId: application.jobId });
  revalidateApplicationPages();
  return { ok: true, message: "Application deleted" };
}

/* -------------------------------------------------------------- Incidents */

export async function resolveIncident(id: string): Promise<AdminJobResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const incident = await prisma.systemIncident.findUnique({ where: { id }, select: { id: true, resolvedAt: true } });
  if (!incident) return { ok: false, error: "Incident not found." };
  if (incident.resolvedAt) return { ok: true, message: "Already resolved." };
  await prisma.systemIncident.update({ where: { id }, data: { resolvedAt: new Date(), resolvedBy: session.user.id } });
  await audit(session.user.id, "incident.resolve", "SystemIncident", id);
  revalidatePath("/admin");
  return { ok: true, message: "Marked resolved" };
}
