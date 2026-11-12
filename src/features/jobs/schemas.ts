import { z } from "zod";
import {
  AGE_MAX,
  AGE_MIN,
  CTC_MAX_LPA,
  EXPERIENCE_MAX,
  INDIAN_CITIES,
  NOTICE_PERIODS,
  QUALIFICATIONS,
  SKILLS_MAX,
  ageOn,
  parseDateOnly,
} from "@/features/jobs/options";

/**
 * Validation for the public "Apply" form. No `server-only`: the client form uses it
 * for inline errors and the server action re-runs it on the raw FormData.
 * The resume file is checked separately (see src/lib/resumes.ts).
 */

/**
 * Normalises an Indian mobile number to `+91XXXXXXXXXX`.
 * Accepts spaces, dashes, brackets, a `+91` / `0091` / `91` prefix or a leading `0`.
 * Returns null when the result is not a 10-digit number starting with 6–9.
 */
export function normalizeIndianMobile(raw: string): string | null {
  let digits = raw.replace(/[\s()\-.]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.length === 14 && digits.startsWith("0091")) digits = digits.slice(4);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

const CTC_RE = /^\d{1,4}(\.\d)?$/;
const CTC_MESSAGE = "Enter the CTC in LPA, for example 6.5";

const ctcValue = z
  .string()
  .trim()
  .regex(CTC_RE, CTC_MESSAGE)
  .transform(Number)
  .refine((n) => n <= CTC_MAX_LPA, `CTC must be ${CTC_MAX_LPA} LPA or less`);

const optionalCtc = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .pipe(ctcValue.optional());

const optionalText = (max: number, min = 2) =>
  z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(
      z
        .string()
        .min(min, `Use at least ${min} characters`)
        .max(max, `Keep this under ${max} characters`)
        .optional()
    );

/** Form inputs submit "" when empty; `z.coerce.number` would turn that into 0. */
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const LINKEDIN_RE = /^https:\/\/(www\.)?linkedin\.com\/[A-Za-z0-9\-_%./]+$/;

export const applySchema = z.object({
  jobId: z.string().trim().min(1, "Job is missing").max(64),
  name: z.string().trim().min(2, "Enter your full name").max(80, "Keep your name under 80 characters"),
  email: z.email("Enter a valid email address").trim().max(120, "Keep your email under 120 characters").toLowerCase(),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const normalized = normalizeIndianMobile(v);
      if (!normalized) {
        ctx.addIssue({ code: "custom", message: "Enter a 10-digit Indian mobile number" });
        return z.NEVER;
      }
      return normalized;
    }),
  dateOfBirth: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const date = parseDateOnly(v);
      if (!date) {
        ctx.addIssue({ code: "custom", message: "Enter your date of birth as YYYY-MM-DD" });
        return z.NEVER;
      }
      const age = ageOn(date, new Date());
      if (age < AGE_MIN || age > AGE_MAX) {
        ctx.addIssue({ code: "custom", message: `You must be between ${AGE_MIN} and ${AGE_MAX} years old to apply` });
        return z.NEVER;
      }
      return date;
    }),
  qualification: z.enum(QUALIFICATIONS, { message: "Choose your highest qualification" }),
  currentCity: z.enum(INDIAN_CITIES, { message: "Choose your current city" }),
  currentCompany: optionalText(80),
  currentDesignation: optionalText(80),
  experienceYears: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ message: "Enter your total experience in years" })
      .int("Enter whole years")
      .min(0, "Experience cannot be negative")
      .max(EXPERIENCE_MAX, `Experience must be ${EXPERIENCE_MAX} years or less`)
  ),
  currentCtcLpa: optionalCtc,
  expectedCtcLpa: ctcValue,
  noticePeriodDays: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ message: "Choose your notice period" })
      .refine((n) => (NOTICE_PERIODS as readonly number[]).includes(n), "Choose your notice period")
  ),
  skills: z
    .string()
    .trim()
    .max(400, "Keep skills under 400 characters")
    .optional()
    .transform((v, ctx) => {
      if (!v) return [] as string[];
      const seen = new Set<string>();
      const out: string[] = [];
      for (const part of v.split(",")) {
        const skill = part.trim().replace(/\s+/g, " ");
        if (!skill) continue;
        if (skill.length > 40) {
          ctx.addIssue({ code: "custom", message: "Each skill must be under 40 characters" });
          return z.NEVER;
        }
        const key = skill.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(skill);
      }
      if (out.length > SKILLS_MAX) {
        ctx.addIssue({ code: "custom", message: `List up to ${SKILLS_MAX} skills` });
        return z.NEVER;
      }
      return out;
    }),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(
      z
        .string()
        .max(200, "Keep the LinkedIn URL under 200 characters")
        .regex(LINKEDIN_RE, "Enter a LinkedIn profile URL starting with https://www.linkedin.com/")
        .optional()
    ),
  coverNote: optionalText(1200, 1),
  consent: z.literal(true, { message: "Please agree to the privacy policy to apply" }),
  // Honeypot: humans never fill this.
  website: z.string().max(0).optional(),
});

export type ApplyInput = z.input<typeof applySchema>;
export type ApplyData = z.output<typeof applySchema>;

/** The form field names, in display order. Used to map FormData to `applySchema`. */
export const APPLY_TEXT_FIELDS = [
  "jobId",
  "name",
  "email",
  "phone",
  "dateOfBirth",
  "qualification",
  "currentCity",
  "currentCompany",
  "currentDesignation",
  "experienceYears",
  "currentCtcLpa",
  "expectedCtcLpa",
  "noticePeriodDays",
  "skills",
  "linkedinUrl",
  "coverNote",
  "website",
] as const;

/** Reads the text fields of the apply form from FormData into the shape `applySchema` expects. */
export function applyInputFromFormData(formData: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of APPLY_TEXT_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string") out[field] = value;
  }
  out.consent = formData.get("consent") === "true" || formData.get("consent") === "on";
  return out;
}
