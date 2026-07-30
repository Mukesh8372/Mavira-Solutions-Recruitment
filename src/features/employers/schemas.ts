import { z } from "zod";

/**
 * Zod schemas shared by the employer server actions and their client forms.
 * Kept out of actions.ts because "use server" modules may only export async functions.
 */

/** Empty string / NaN (from number inputs) → undefined, otherwise coerce to a whole number. */
const optionalInt = (max: number, message?: string) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
    z.coerce.number().int(message ?? "Use a whole number").min(0, "Can't be negative").max(max).optional()
  );

export const jobSchema = z
  .object({
    id: z.string().optional(), // present on edit
    title: z.string().trim().min(4, "Give the role a proper title").max(80, "Keep the title under 80 characters"),
    departmentId: z.string().min(1, "Pick a department"),
    location: z.string().trim().min(2, "Where is this role based?").max(60),
    workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
    experienceMin: z.coerce.number().int("Use whole years").min(0, "Can't be negative").max(50),
    experienceMax: z.coerce.number().int("Use whole years").min(0, "Can't be negative").max(50),
    salaryMin: optionalInt(1_000_000_000),
    salaryMax: optionalInt(1_000_000_000),
    salaryVisible: z.boolean(),
    description: z.string().trim().min(40, "Describe the role in at least 40 characters").max(6000, "Keep the description under 6000 characters"),
    responsibilities: z.string().trim().max(3000, "Keep responsibilities under 3000 characters").optional(),
    requirements: z.string().trim().max(3000, "Keep requirements under 3000 characters").optional(),
    benefits: z.string().trim().max(3000, "Keep benefits under 3000 characters").optional(),
    skills: z.string().trim().max(400, "Keep skills under 400 characters").optional(),
    urgent: z.boolean(),
  })
  .refine((d) => d.experienceMax >= d.experienceMin, {
    message: "Max experience can't be below min",
    path: ["experienceMax"],
  })
  .refine((d) => d.salaryMin === undefined || d.salaryMax === undefined || d.salaryMax >= d.salaryMin, {
    message: "Max salary can't be below min",
    path: ["salaryMax"],
  });

export type JobInput = z.input<typeof jobSchema>;

export const interviewSchema = z.object({
  applicationId: z.string().min(1),
  scheduledAt: z
    .string()
    .min(1, "Pick a date and time")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Enter a valid date and time")
    .refine((v) => new Date(v).getTime() > Date.now(), "Pick a future date and time"),
  mode: z.enum(["CALL", "VIDEO", "ONSITE"]),
  meetingUrl: z.string().trim().url("Enter a valid meeting link (https://…)").optional().or(z.literal("")),
  location: z.string().trim().max(120, "Keep the location under 120 characters").optional(),
  interviewer: z.string().trim().max(80, "Keep the interviewer name under 80 characters").optional(),
});

export type InterviewInput = z.input<typeof interviewSchema>;

export const companySchema = z.object({
  about: z.string().trim().max(2000, "Keep the about section under 2000 characters").optional(),
  website: z.string().trim().url("Enter a valid URL (https://…)").optional().or(z.literal("")),
  size: z.string().trim().max(40).optional(),
  industry: z.string().trim().max(60).optional(),
});

export type CompanyInput = z.input<typeof companySchema>;

/** Statuses an employer may move an application to. */
export const EMPLOYER_STATUS_TARGETS = ["SCREENING", "SHORTLISTED", "INTERVIEW", "OFFERED", "PLACED", "REJECTED"] as const;
export type EmployerStatusTarget = (typeof EMPLOYER_STATUS_TARGETS)[number];
