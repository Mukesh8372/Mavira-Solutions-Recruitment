/**
 * Fixed option lists for the public apply form and the admin applicant filters.
 * No `server-only`: shared by client components, server actions and tests.
 */

export const QUALIFICATIONS = [
  "10th",
  "12th",
  "Diploma",
  "Graduate",
  "Post Graduate",
  "Professional (CA/CFA/MBA)",
] as const;
export type Qualification = (typeof QUALIFICATIONS)[number];

export const INDIAN_CITIES = [
  "Mumbai",
  "Thane",
  "Navi Mumbai",
  "Pune",
  "Delhi",
  "Gurugram",
  "Noida",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Indore",
  "Nagpur",
  "Chandigarh",
  "Kochi",
  "Bhopal",
  "Other",
] as const;
export type IndianCity = (typeof INDIAN_CITIES)[number];

export const NOTICE_PERIODS = [0, 15, 30, 60, 90] as const;
export type NoticePeriod = (typeof NOTICE_PERIODS)[number];

export function noticePeriodLabel(days: number): string {
  if (days === 0) return "Immediate";
  return `${days} days`;
}

export const AGE_MIN = 18;
export const AGE_MAX = 65;

export const EXPERIENCE_MAX = 50;
export const CTC_MAX_LPA = 1000;
export const SKILLS_MAX = 10;

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses `YYYY-MM-DD` into a Date at 00:00 UTC. Returns null for a malformed or impossible date. */
export function parseDateOnly(value: string): Date | null {
  const m = DATE_ONLY_RE.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

/** Formats a Date as `YYYY-MM-DD` using its UTC fields. */
export function formatDateOnly(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole years between a date of birth and a reference date, both read in UTC. */
export function ageOn(dateOfBirth: Date, on: Date): number {
  let age = on.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const beforeBirthday =
    on.getUTCMonth() < dateOfBirth.getUTCMonth() ||
    (on.getUTCMonth() === dateOfBirth.getUTCMonth() && on.getUTCDate() < dateOfBirth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** The latest date of birth that gives at least `age` whole years on `on`. */
export function dateOfBirthForAge(age: number, on: Date): Date {
  return new Date(Date.UTC(on.getUTCFullYear() - age, on.getUTCMonth(), on.getUTCDate()));
}
