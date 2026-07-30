"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { saveUploadedResume } from "@/lib/uploads";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export async function toggleSaveJob(jobId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return { ok: false, error: "unauthenticated" };
  }
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { ok: false, error: "Candidate profile not found" };

  const existing = await prisma.savedJob.findUnique({
    where: { candidateId_jobId: { candidateId: profile.id, jobId } },
  });
  if (existing) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedJob.create({ data: { candidateId: profile.id, jobId } });
  }
  revalidatePath("/dashboard/saved");
  return { ok: true };
}

const applySchema = z.object({
  jobId: z.string().min(1),
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(16, "Enter a valid phone number"),
  coverNote: z.string().trim().max(1200, "Keep your note under 1200 characters").optional(),
  website: z.string().max(0).optional(), // honeypot
});

const allowedResumeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const maxResumeBytes = 5 * 1024 * 1024;

/**
 * Public apply flow. Works for guests: creates a shadow CANDIDATE account
 * keyed by email so the applicant can later set a password and track status.
 */
export async function applyToJob(formData: FormData): Promise<ActionResult> {
  const parsed = applySchema.safeParse({
    jobId: formData.get("jobId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    coverNote: formData.get("coverNote") || undefined,
    website: formData.get("website") || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (parsed.data.website) return { ok: true, message: "Application received" };

  const { ok } = rateLimit(await clientKey("apply"), { limit: 5, windowMs: 300_000 });
  if (!ok) return { ok: false, error: "Too many applications from this device. Please try again in a few minutes." };

  const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!job || job.status !== "PUBLISHED") return { ok: false, error: "This role is no longer accepting applications." };

  const resumeFile = formData.get("resume");
  if (!(resumeFile instanceof File) || resumeFile.size === 0) {
    return { ok: false, error: "Attach your resume (PDF or Word, up to 5 MB)." };
  }
  if (!allowedResumeTypes.includes(resumeFile.type)) {
    return { ok: false, error: "Resume must be a PDF or Word document." };
  }
  if (resumeFile.size > maxResumeBytes) {
    return { ok: false, error: "Resume is larger than 5 MB." };
  }

  const session = await auth();
  const email = parsed.data.email.toLowerCase();

  // Resolve or create the candidate (shadow account for guests).
  let user = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id }, include: { candidateProfile: true } })
    : await prisma.user.findUnique({ where: { email }, include: { candidateProfile: true } });

  if (user && user.role !== "CANDIDATE") {
    return { ok: false, error: "This email belongs to a non-candidate account. Use a personal email." };
  }
  if (!user) {
    const tempPassword = await hash(crypto.randomUUID(), 12);
    user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        phone: parsed.data.phone,
        role: "CANDIDATE",
        passwordHash: tempPassword,
        candidateProfile: { create: { profileScore: 30 } },
      },
      include: { candidateProfile: true },
    });
  }
  const profile =
    user.candidateProfile ??
    (await prisma.candidateProfile.create({ data: { userId: user.id, profileScore: 30 } }));

  const duplicate = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId: job.id, candidateId: profile.id } },
  });
  if (duplicate) return { ok: false, error: "You've already applied to this role. Track it from your dashboard." };

  const stored = await saveUploadedResume(resumeFile);
  const resume = await prisma.resume.create({
    data: {
      candidateId: profile.id,
      fileUrl: stored.url,
      fileName: resumeFile.name,
      mimeType: resumeFile.type,
      sizeBytes: resumeFile.size,
      isPrimary: true,
    },
  });

  await prisma.application.create({
    data: {
      jobId: job.id,
      candidateId: profile.id,
      resumeId: resume.id,
      coverNote: parsed.data.coverNote,
      source: "website",
      statusHistory: JSON.stringify([{ status: "APPLIED", at: new Date().toISOString() }]),
    },
  });

  revalidatePath(`/jobs/${job.slug}`);
  return {
    ok: true,
    message: session?.user
      ? "Application submitted — track it from your dashboard."
      : "Application submitted. We've created a candidate profile for you — check your email to set a password and track your status.",
  };
}

const resumePoolSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(16, "Enter a valid phone number"),
  website: z.string().max(0).optional(),
});

/** General talent-pool resume upload (candidates hub). */
export async function uploadResumeToPool(formData: FormData): Promise<ActionResult> {
  const parsed = resumePoolSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website") || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (parsed.data.website) return { ok: true };

  const { ok } = rateLimit(await clientKey("resume-pool"), { limit: 3, windowMs: 300_000 });
  if (!ok) return { ok: false, error: "Too many uploads from this device. Please try again later." };

  const resumeFile = formData.get("resume");
  if (!(resumeFile instanceof File) || resumeFile.size === 0) {
    return { ok: false, error: "Attach your resume (PDF or Word, up to 5 MB)." };
  }
  if (!allowedResumeTypes.includes(resumeFile.type)) return { ok: false, error: "Resume must be a PDF or Word document." };
  if (resumeFile.size > maxResumeBytes) return { ok: false, error: "Resume is larger than 5 MB." };

  const email = parsed.data.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email }, include: { candidateProfile: true } });
  if (user && user.role !== "CANDIDATE") return { ok: false, error: "This email belongs to a non-candidate account." };
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        phone: parsed.data.phone,
        role: "CANDIDATE",
        passwordHash: await hash(crypto.randomUUID(), 12),
        candidateProfile: { create: { profileScore: 25 } },
      },
      include: { candidateProfile: true },
    });
  }
  const profile =
    user.candidateProfile ?? (await prisma.candidateProfile.create({ data: { userId: user.id, profileScore: 25 } }));

  const stored = await saveUploadedResume(resumeFile);
  await prisma.resume.updateMany({ where: { candidateId: profile.id }, data: { isPrimary: false } });
  await prisma.resume.create({
    data: {
      candidateId: profile.id,
      fileUrl: stored.url,
      fileName: resumeFile.name,
      mimeType: resumeFile.type,
      sizeBytes: resumeFile.size,
      isPrimary: true,
    },
  });

  return { ok: true, message: "Resume received. Our placement team will reach out when a matching role opens." };
}
