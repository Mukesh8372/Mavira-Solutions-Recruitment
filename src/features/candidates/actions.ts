"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedResume } from "@/lib/uploads";

export type CandidateActionResult = { ok: true; message?: string } | { ok: false; error: string };

const profileSchema = z.object({
  headline: z.string().trim().max(80, "Keep the headline under 80 characters").optional(),
  summary: z.string().trim().max(1000, "Keep the summary under 1000 characters").optional(),
  experienceYears: z.coerce.number().min(0).max(50).optional(),
  location: z.string().trim().max(60).optional(),
  expectedSalary: z.coerce.number().min(0).max(100_000_000).optional(),
  skills: z.string().trim().max(400).optional(), // comma-separated
  phone: z.string().trim().min(8, "Enter a valid phone number").max(16).optional().or(z.literal("")),
});

async function requireCandidate() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") return null;
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  return profile ? { session, profile } : null;
}

export async function updateCandidateProfile(input: z.infer<typeof profileSchema>): Promise<CandidateActionResult> {
  const ctx = await requireCandidate();
  if (!ctx) return { ok: false, error: "You need to be signed in as a candidate." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const skills = (parsed.data.skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

  await prisma.candidateProfile.update({
    where: { id: ctx.profile.id },
    data: {
      headline: parsed.data.headline || null,
      summary: parsed.data.summary || null,
      experienceYears: parsed.data.experienceYears ?? null,
      location: parsed.data.location || null,
      expectedSalary: parsed.data.expectedSalary ?? null,
      skills: JSON.stringify(skills),
    },
  });
  if (parsed.data.phone) {
    await prisma.user.update({ where: { id: ctx.session.user.id }, data: { phone: parsed.data.phone } });
  }
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile updated" };
}

const allowedResumeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function uploadResumeAuthed(formData: FormData): Promise<CandidateActionResult> {
  const ctx = await requireCandidate();
  if (!ctx) return { ok: false, error: "You need to be signed in as a candidate." };

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a resume file first." };
  if (!allowedResumeTypes.includes(file.type)) return { ok: false, error: "Resume must be a PDF or Word document." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Resume is larger than 5 MB." };

  const stored = await saveUploadedResume(file);
  await prisma.resume.updateMany({ where: { candidateId: ctx.profile.id }, data: { isPrimary: false } });
  await prisma.resume.create({
    data: {
      candidateId: ctx.profile.id,
      fileUrl: stored.url,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      isPrimary: true,
    },
  });
  revalidatePath("/dashboard/profile");
  return { ok: true, message: "Resume uploaded" };
}

export async function deleteResume(resumeId: string): Promise<CandidateActionResult> {
  const ctx = await requireCandidate();
  if (!ctx) return { ok: false, error: "You need to be signed in as a candidate." };
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.candidateId !== ctx.profile.id) return { ok: false, error: "Resume not found." };
  const inUse = await prisma.application.count({ where: { resumeId } });
  if (inUse > 0) return { ok: false, error: "This resume is attached to an application and can't be deleted." };
  await prisma.resume.delete({ where: { id: resumeId } });
  revalidatePath("/dashboard/profile");
  return { ok: true, message: "Resume deleted" };
}

export async function withdrawApplication(applicationId: string): Promise<CandidateActionResult> {
  const ctx = await requireCandidate();
  if (!ctx) return { ok: false, error: "You need to be signed in as a candidate." };
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application || application.candidateId !== ctx.profile.id) return { ok: false, error: "Application not found." };
  if (["PLACED", "REJECTED", "WITHDRAWN"].includes(application.status)) {
    return { ok: false, error: "This application can no longer be withdrawn." };
  }
  const history = JSON.parse((application.statusHistory as string) || "[]") as unknown[];
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "WITHDRAWN",
      statusHistory: JSON.stringify([...history, { status: "WITHDRAWN", at: new Date().toISOString() }]),
    },
  });
  revalidatePath("/dashboard/applications");
  return { ok: true, message: "Application withdrawn" };
}

export async function markNotificationsRead(): Promise<CandidateActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "You need to be signed in." };
  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard/notifications");
  return { ok: true };
}
