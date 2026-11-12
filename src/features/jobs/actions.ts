"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { recordIncident } from "@/lib/incidents";
import {
  RESUME_MAX_BYTES,
  RESUME_MIME_BY_EXT,
  RESUME_TYPE_ERROR,
  detectResumeKind,
  newResumeKey,
  resumeExtFromFileName,
  safeDownloadName,
} from "@/lib/resumes";
import { StorageError, deleteResumeQuietly, putResume, storageConfigured } from "@/lib/resume-storage";
import { applyInputFromFormData, applySchema } from "@/features/jobs/schemas";
import { getOpenJobById } from "@/features/jobs/queries";

export type ApplyErrorCode = "INVALID" | "RATE_LIMITED" | "RESUME" | "CLOSED" | "DUPLICATE" | "STORAGE" | "FAILED";
export type ApplyResult = { ok: true } | { ok: false; error: string; code: ApplyErrorCode; field?: string };

const DUPLICATE_MESSAGE = "You have already applied for this job. Our team has your application.";
const STORAGE_MESSAGE = "We couldn't save your resume right now. Please email it to us and mention the job title.";

/**
 * Public "Apply" action. Receives the form fields and the resume file in one multipart
 * body (see `serverActions.bodySizeLimit` in next.config.ts). Checks run in this order:
 * honeypot, IP rate limit, field validation, email rate limit, file checks, job open,
 * duplicate, storage, database. A file is never stored before every cheaper check passes.
 */
export async function applyToJob(formData: FormData): Promise<ApplyResult> {
  // 1. Honeypot: bots fill it, people never see it. Pretend it worked and store nothing.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.length > 0) return { ok: true };

  // 2. Per-device limit, before any parsing work.
  const ipLimit = rateLimit(await clientKey("apply"), { limit: 5, windowMs: 600_000 });
  if (!ipLimit.ok) {
    return { ok: false, code: "RATE_LIMITED", error: "Too many applications from this device. Please try again in a few minutes." };
  }

  // 3. Fields.
  const parsed = applySchema.safeParse(applyInputFromFormData(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = typeof issue?.path[0] === "string" ? issue.path[0] : undefined;
    return { ok: false, code: "INVALID", error: issue?.message ?? "Please check the form and try again.", field };
  }
  const data = parsed.data;

  // 4. Per-email limit.
  const emailLimit = rateLimit(`apply-email:${data.email}`, { limit: 3, windowMs: 3_600_000 });
  if (!emailLimit.ok) {
    return { ok: false, code: "RATE_LIMITED", error: "Too many applications for this email. Please try again later." };
  }

  // 5. File: present, within size, allowed extension, and real bytes match the extension.
  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, code: "RESUME", field: "resume", error: "Attach your resume (PDF or Word, up to 2 MB)." };
  }
  if (file.size > RESUME_MAX_BYTES) {
    return { ok: false, code: "RESUME", field: "resume", error: RESUME_TYPE_ERROR };
  }
  const ext = resumeExtFromFileName(file.name);
  if (!ext) return { ok: false, code: "RESUME", field: "resume", error: RESUME_TYPE_ERROR };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = detectResumeKind(bytes);
  if (kind !== ext) {
    return { ok: false, code: "RESUME", field: "resume", error: "That file is not a valid PDF or Word document. Export it again and retry." };
  }

  // 6. The job must still accept applications.
  const job = await getOpenJobById(data.jobId);
  if (!job) return { ok: false, code: "CLOSED", error: "This job is no longer accepting applications." };

  // 7. One application per job per email.
  const duplicate = await prisma.jobApplication.findUnique({
    where: { jobId_applicantEmail: { jobId: job.id, applicantEmail: data.email } },
    select: { id: true },
  });
  if (duplicate) return { ok: false, code: "DUPLICATE", error: DUPLICATE_MESSAGE };

  // 8. Store the file.
  const resumeKey = newResumeKey(ext);
  if (!storageConfigured()) {
    await recordIncident("resume.upload", "Resume storage is not configured (R2_* variables missing).", { jobId: job.id });
    return { ok: false, code: "STORAGE", error: STORAGE_MESSAGE };
  }
  try {
    await putResume(resumeKey, bytes, RESUME_MIME_BY_EXT[ext]);
  } catch (err) {
    const e = err instanceof StorageError ? err : new StorageError("put", err);
    console.error("[apply] resume upload failed", e.message);
    await recordIncident("resume.upload", "A candidate's resume could not be uploaded to storage.", {
      error: e.message,
      status: e.status,
      jobId: job.id,
    });
    return { ok: false, code: "STORAGE", error: STORAGE_MESSAGE };
  }

  // 9. Save the application. If this fails, remove the file so storage holds no orphans.
  try {
    await prisma.jobApplication.create({
      data: {
        jobId: job.id,
        applicantName: data.name,
        applicantEmail: data.email,
        applicantPhone: data.phone,
        dateOfBirth: data.dateOfBirth,
        qualification: data.qualification,
        currentCity: data.currentCity,
        currentCompany: data.currentCompany ?? null,
        currentDesignation: data.currentDesignation ?? null,
        experienceYears: data.experienceYears,
        currentCtcLpa: data.currentCtcLpa ?? null,
        expectedCtcLpa: data.expectedCtcLpa,
        noticePeriodDays: data.noticePeriodDays,
        skills: JSON.stringify(data.skills),
        linkedinUrl: data.linkedinUrl ?? null,
        coverNote: data.coverNote ?? null,
        resumeKey,
        resumeFileName: safeDownloadName(file.name, ext),
        resumeMimeType: RESUME_MIME_BY_EXT[ext],
        resumeSizeBytes: bytes.byteLength,
        consentAt: new Date(),
        status: "APPLIED",
        statusHistory: JSON.stringify([{ status: "APPLIED", at: new Date().toISOString() }]),
        source: "website",
      },
    });
  } catch (err) {
    await deleteResumeQuietly(resumeKey, { jobId: job.id });
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, code: "DUPLICATE", error: DUPLICATE_MESSAGE };
    }
    console.error("[apply] could not save application", err);
    await recordIncident("resume.upload", "An application could not be saved after its resume was stored. The file was removed.", {
      error: err instanceof Error ? err.name : "UnknownError",
      jobId: job.id,
    });
    return { ok: false, code: "FAILED", error: "Something went wrong while saving your application. Please try again." };
  }

  // 10. Admin pages that list applications.
  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/admin/jobs");
  return { ok: true };
}
