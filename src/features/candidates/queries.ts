import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { jobInclude } from "@/features/jobs/queries";

export const getCandidateProfile = cache(async (userId: string) => {
  return prisma.candidateProfile.findUnique({
    where: { userId },
    include: { user: true, resumes: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] } },
  });
});

export async function getCandidateOverview(userId: string) {
  const profile = await getCandidateProfile(userId);
  if (!profile) return null;
  const [applicationCount, savedCount, upcomingInterviews, recentApplications] = await Promise.all([
    prisma.application.count({ where: { candidateId: profile.id } }),
    prisma.savedJob.count({ where: { candidateId: profile.id } }),
    prisma.interview.findMany({
      where: { application: { candidateId: profile.id }, status: "SCHEDULED", scheduledAt: { gte: new Date() } },
      include: { application: { include: { job: { include: { company: true } } } } },
      orderBy: { scheduledAt: "asc" },
      take: 3,
    }),
    prisma.application.findMany({
      where: { candidateId: profile.id },
      include: { job: { include: { company: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);
  return { profile, applicationCount, savedCount, upcomingInterviews, recentApplications };
}

export async function getCandidateApplications(userId: string) {
  const profile = await getCandidateProfile(userId);
  if (!profile) return [];
  return prisma.application.findMany({
    where: { candidateId: profile.id },
    include: { job: { include: { company: true, department: true } }, interviews: { orderBy: { scheduledAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCandidateSavedJobs(userId: string) {
  const profile = await getCandidateProfile(userId);
  if (!profile) return [];
  return prisma.savedJob.findMany({
    where: { candidateId: profile.id },
    include: { job: { include: jobInclude } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCandidateInterviews(userId: string) {
  const profile = await getCandidateProfile(userId);
  if (!profile) return [];
  return prisma.interview.findMany({
    where: { application: { candidateId: profile.id } },
    include: { application: { include: { job: { include: { company: true } } } } },
    orderBy: { scheduledAt: "desc" },
  });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}

/** Profile completion: weighted checklist surfaced in the dashboard. */
export function computeProfileCompletion(profile: {
  headline: string | null;
  summary: string | null;
  experienceYears: number | null;
  location: string | null;
  expectedSalary: number | null;
  skills: unknown;
  resumes: unknown[];
  user: { phone: string | null };
}) {
  const skills = typeof profile.skills === "string" ? (JSON.parse(profile.skills || "[]") as string[]) : [];
  const checks = [
    { label: "Add a headline", done: !!profile.headline, weight: 15 },
    { label: "Write a short summary", done: !!profile.summary, weight: 15 },
    { label: "Add your experience", done: profile.experienceYears !== null, weight: 10 },
    { label: "Set your location", done: !!profile.location, weight: 10 },
    { label: "Set expected salary", done: profile.expectedSalary !== null, weight: 10 },
    { label: "List at least 3 skills", done: skills.length >= 3, weight: 15 },
    { label: "Upload a resume", done: profile.resumes.length > 0, weight: 20 },
    { label: "Add a phone number", done: !!profile.user.phone, weight: 5 },
  ];
  const score = checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0);
  return { score, checks };
}
