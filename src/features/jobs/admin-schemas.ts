import { z } from "zod";
import type { ApplicationStatus, JobStatus } from "@prisma/client";
import { parseDateOnly, formatDateOnly } from "@/features/jobs/options";

/**
 * Validation for the admin job, client and application screens.
 * No `server-only`: the forms run the same rules for inline errors.
 */

export const WORK_MODES = ["ONSITE", "REMOTE", "HYBRID"] as const;
export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] as const;
export const JOB_FORM_STATUSES = ["DRAFT", "PUBLISHED"] as const;

/* ---------------- IST dates ---------------- */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Today's date in India as YYYY-MM-DD. */
export function istToday(now = new Date()): string {
  return formatDateOnly(new Date(now.getTime() + IST_OFFSET_MS));
}

/** A YYYY-MM-DD string as 23:59:59 IST, stored in UTC. Null when malformed. */
export function istDayEnd(dateOnly: string): Date | null {
  const d = parseDateOnly(dateOnly);
  if (!d) return null;
  return new Date(d.getTime() + 24 * 60 * 60 * 1000 - 1000 - IST_OFFSET_MS);
}

/** A YYYY-MM-DD string as 00:00:00 IST, stored in UTC. Null when malformed. */
export function istDayStart(dateOnly: string): Date | null {
  const d = parseDateOnly(dateOnly);
  if (!d) return null;
  return new Date(d.getTime() - IST_OFFSET_MS);
}

/** A stored instant as the YYYY-MM-DD it falls on in India. */
export function istDateOnly(date: Date): string {
  return formatDateOnly(new Date(date.getTime() + IST_OFFSET_MS));
}

/* ---------------- shared pieces ---------------- */

const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const LPA_RE = /^\d{1,4}(\.\d)?$/;
const lpa = z
  .string()
  .trim()
  .regex(LPA_RE, "Enter the amount in LPA, for example 6.5")
  .transform(Number)
  .refine((n) => n <= 1000, "Must be 1000 LPA or less");
const optionalLpa = z.preprocess(blankToUndefined, lpa.optional());

const optionalText = (max: number, min = 1) =>
  z.preprocess(blankToUndefined, z.string().trim().min(min, `Use at least ${min} characters`).max(max, `Keep this under ${max} characters`).optional());

/** A textarea with one item per line, trimmed, empty lines dropped. */
const lines = (max: number, maxItems: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .transform((v) =>
      (v ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, maxItems)
    );

const csv = (max: number, maxItems: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .transform((v) => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const part of (v ?? "").split(",")) {
        const s = part.trim().replace(/\s+/g, " ");
        if (!s || seen.has(s.toLowerCase())) continue;
        seen.add(s.toLowerCase());
        out.push(s);
      }
      return out.slice(0, maxItems);
    });

/* ---------------- jobs ---------------- */

export const jobSchema = z
  .object({
    title: z.string().trim().min(4, "Give the role a proper title").max(80, "Keep the title under 80 characters"),
    departmentId: z.string().trim().min(1, "Choose a role category"),
    industryId: z.preprocess(blankToUndefined, z.string().trim().optional()),
    companyId: z.preprocess(blankToUndefined, z.string().trim().optional()),
    newCompanyName: optionalText(80, 2),
    newCompanyWebsite: z.preprocess(blankToUndefined, z.string().trim().url("Enter a full URL (https://…)").max(200).optional()),
    confidential: z.boolean(),
    confidentialLabel: optionalText(80, 2),
    location: z.string().trim().min(2, "Where is this role based?").max(60, "Keep the location under 60 characters"),
    workMode: z.enum(WORK_MODES),
    employmentType: z.enum(EMPLOYMENT_TYPES),
    experienceMin: z.preprocess(blankToUndefined, z.coerce.number({ message: "Enter whole years" }).int("Use whole years").min(0, "Can't be negative").max(50)),
    experienceMax: z.preprocess(blankToUndefined, z.coerce.number({ message: "Enter whole years" }).int("Use whole years").min(0, "Can't be negative").max(50)),
    salaryMinLpa: optionalLpa,
    salaryMaxLpa: optionalLpa,
    salaryVisible: z.boolean(),
    featured: z.boolean(),
    urgent: z.boolean(),
    validThrough: z.preprocess(blankToUndefined, z.string().trim().optional()),
    description: z.string().trim().min(40, "Describe the role in at least 40 characters").max(6000, "Keep the description under 6000 characters"),
    responsibilities: lines(3000, 20),
    requirements: lines(3000, 20),
    benefits: lines(3000, 20),
    skills: csv(400, 20),
    seoTitle: optionalText(70),
    seoDescription: optionalText(160),
    status: z.enum(JOB_FORM_STATUSES),
  })
  .superRefine((d, ctx) => {
    if (!d.companyId && !d.newCompanyName) {
      ctx.addIssue({ code: "custom", path: ["companyId"], message: "Choose a client or enter a new client name" });
    }
    if (d.companyId && d.newCompanyName) {
      ctx.addIssue({ code: "custom", path: ["newCompanyName"], message: "Either pick an existing client or add a new one, not both" });
    }
    if (d.confidential && !d.confidentialLabel) {
      ctx.addIssue({ code: "custom", path: ["confidentialLabel"], message: "Add the label shown instead of the client name, e.g. “Leading private bank”" });
    }
    if (d.experienceMax < d.experienceMin) {
      ctx.addIssue({ code: "custom", path: ["experienceMax"], message: "Max experience can't be below min" });
    }
    if (d.salaryMinLpa !== undefined && d.salaryMaxLpa !== undefined && d.salaryMaxLpa < d.salaryMinLpa) {
      ctx.addIssue({ code: "custom", path: ["salaryMaxLpa"], message: "Max salary can't be below min" });
    }
    if (d.validThrough !== undefined) {
      if (!parseDateOnly(d.validThrough)) {
        ctx.addIssue({ code: "custom", path: ["validThrough"], message: "Enter the apply-by date as YYYY-MM-DD" });
      } else if (d.validThrough < istToday()) {
        ctx.addIssue({ code: "custom", path: ["validThrough"], message: "The apply-by date is in the past. Extend or clear it." });
      }
    }
  });

export type JobInput = z.input<typeof jobSchema>;
export type JobData = z.output<typeof jobSchema>;

/** Allowed status moves. Anything not listed is refused by setJobStatus. */
export const JOB_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  DRAFT: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["CLOSED"],
  CLOSED: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export function canTransitionJob(from: JobStatus, to: JobStatus): boolean {
  return JOB_STATUS_TRANSITIONS[from].includes(to);
}

export const JOB_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"] as const;
export const jobStatusSchema = z.enum(JOB_STATUSES);

/* ---------------- clients ---------------- */

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Enter the client name").max(80, "Keep the name under 80 characters"),
  website: z.preprocess(blankToUndefined, z.string().trim().url("Enter a full URL (https://…)").max(200).optional()),
  industry: optionalText(60),
  size: optionalText(40),
  about: optionalText(2000),
});
export type ClientInput = z.input<typeof clientSchema>;

/* ---------------- applications ---------------- */

export const APPLICATION_STATUSES = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "PLACED",
  "REJECTED",
  "WITHDRAWN",
] as const satisfies readonly ApplicationStatus[];
export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);

export const adminNoteSchema = z.string().trim().max(2000, "Keep the note under 2000 characters");
