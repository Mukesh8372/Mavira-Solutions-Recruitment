const lakh = 100_000;

/** Format an annual INR amount as LPA (lakhs per annum), e.g. 2800000 -> "28 LPA". */
export function formatLpa(amount: number): string {
  const l = amount / lakh;
  return `${Number.isInteger(l) ? l : l.toFixed(1)}`;
}

export function formatSalaryRange(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  if (min && max) return `₹${formatLpa(min)}–${formatLpa(max)} LPA`;
  const single = min ?? max;
  return single ? `₹${formatLpa(single)} LPA` : null;
}

export function formatExperience(min: number, max: number): string {
  if (min === 0 && max <= 1) return "Fresher";
  if (min === max) return `${min} yrs`;
  return `${min}–${max} yrs`;
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const labelMaps = {
  workMode: { ONSITE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid" },
  employmentType: { FULL_TIME: "Full-time", PART_TIME: "Part-time", CONTRACT: "Contract", INTERNSHIP: "Internship" },
  applicationStatus: {
    APPLIED: "Applied", SCREENING: "Screening", SHORTLISTED: "Shortlisted", INTERVIEW: "Interview",
    OFFERED: "Offered", PLACED: "Placed", REJECTED: "Not selected", WITHDRAWN: "Withdrawn",
  },
  leadStatus: { NEW: "New", CONTACTED: "Contacted", QUALIFIED: "Qualified", CONVERTED: "Converted", LOST: "Lost" },
} as const;

export function labelWorkMode(v: string): string {
  return labelMaps.workMode[v as keyof typeof labelMaps.workMode] ?? v;
}
export function labelEmploymentType(v: string): string {
  return labelMaps.employmentType[v as keyof typeof labelMaps.employmentType] ?? v;
}
export function labelApplicationStatus(v: string): string {
  return labelMaps.applicationStatus[v as keyof typeof labelMaps.applicationStatus] ?? v;
}
export function labelLeadStatus(v: string): string {
  return labelMaps.leadStatus[v as keyof typeof labelMaps.leadStatus] ?? v;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}
