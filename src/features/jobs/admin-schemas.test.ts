import { describe, expect, it } from "vitest";
import { canTransitionJob, categoryKey, categoryNameSchema, istDateOnly, istDayEnd, istDayStart, istToday, jobSchema } from "@/features/jobs/admin-schemas";

const valid = {
  title: "Relationship Manager",
  departmentId: "dep_1",
  industryId: "",
  employerLabel: "Leading private bank",
  location: "Thane",
  workMode: "ONSITE",
  employmentType: "FULL_TIME",
  experienceMin: "2",
  experienceMax: "5",
  salaryMinLpa: "4",
  salaryMaxLpa: "7.5",
  salaryVisible: true,
  featured: false,
  urgent: false,
  validThrough: "",
  description: "Manage HNI client relationships for a leading private bank in Thane. Drive CASA and TPP.",
  responsibilities: "Acquire clients\n\n  Grow book  \n",
  requirements: "",
  benefits: "",
  skills: "CASA, casa, Wealth Management",
  seoTitle: "",
  seoDescription: "",
  status: "DRAFT",
};

const firstError = (input: Record<string, unknown>) => {
  const r = jobSchema.safeParse(input);
  return r.success ? null : `${String(r.error.issues[0]?.path[0])}: ${r.error.issues[0]?.message}`;
};

describe("jobSchema", () => {
  it("accepts a valid job and normalises lists and numbers", () => {
    const r = jobSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.industryId).toBeUndefined();
    expect(r.data.experienceMin).toBe(2);
    expect(r.data.salaryMaxLpa).toBe(7.5);
    expect(r.data.responsibilities).toEqual(["Acquire clients", "Grow book"]);
    expect(r.data.skills).toEqual(["CASA", "Wealth Management"]);
    expect(r.data.validThrough).toBeUndefined();
  });
  it("requires the hiring company label", () => {
    expect(firstError({ ...valid, employerLabel: "" })).toMatch(/^employerLabel: Describe the hiring company/);
    expect(firstError({ ...valid, employerLabel: "   " })).toMatch(/^employerLabel:/);
    expect(firstError({ ...valid, employerLabel: "x".repeat(81) })).toBe("employerLabel: Keep it under 80 characters");
    expect(firstError({ ...valid, employerLabel: "  Top broking house  " })).toBeNull();
    const r = jobSchema.safeParse({ ...valid, employerLabel: "  Top broking house  " });
    expect(r.success && r.data.employerLabel).toBe("Top broking house");
  });
  it("checks ranges", () => {
    expect(firstError({ ...valid, experienceMax: "1" })).toBe("experienceMax: Max experience can't be below min");
    expect(firstError({ ...valid, salaryMaxLpa: "3" })).toBe("salaryMaxLpa: Max salary can't be below min");
    expect(firstError({ ...valid, experienceMin: "" })).toMatch(/experienceMin/);
    expect(firstError({ ...valid, salaryMinLpa: "4.25" })).toMatch(/LPA/);
  });
  it("checks the apply-by date", () => {
    expect(firstError({ ...valid, validThrough: "2020-01-01" })).toMatch(/in the past/);
    expect(firstError({ ...valid, validThrough: "2026-02-30" })).toMatch(/YYYY-MM-DD/);
    expect(firstError({ ...valid, validThrough: istToday() })).toBeNull();
  });
});

describe("IST helpers", () => {
  it("converts a date-only string to IST day bounds in UTC", () => {
    expect(istDayStart("2026-11-12")?.toISOString()).toBe("2026-11-11T18:30:00.000Z");
    expect(istDayEnd("2026-11-12")?.toISOString()).toBe("2026-11-12T18:29:59.000Z");
    expect(istDayEnd("bad")).toBeNull();
  });
  it("reads the IST calendar date of an instant", () => {
    expect(istDateOnly(new Date("2026-11-12T18:29:59.000Z"))).toBe("2026-11-12");
    expect(istDateOnly(new Date("2026-11-12T18:30:00.000Z"))).toBe("2026-11-13");
    expect(istToday(new Date("2026-11-12T20:00:00.000Z"))).toBe("2026-11-13");
  });
});

describe("job status transitions", () => {
  it("allows only the listed moves", () => {
    expect(canTransitionJob("DRAFT", "PUBLISHED")).toBe(true);
    expect(canTransitionJob("PUBLISHED", "CLOSED")).toBe(true);
    expect(canTransitionJob("CLOSED", "PUBLISHED")).toBe(true);
    expect(canTransitionJob("ARCHIVED", "DRAFT")).toBe(true);
    expect(canTransitionJob("ARCHIVED", "PUBLISHED")).toBe(false);
    expect(canTransitionJob("PUBLISHED", "DRAFT")).toBe(false);
    expect(canTransitionJob("DRAFT", "CLOSED")).toBe(false);
  });
});

describe("categoryNameSchema", () => {
  const name = (value: unknown) => {
    const r = categoryNameSchema.safeParse(value);
    return r.success ? r.data : r.error.issues[0]?.message;
  };
  it("tidies spaces", () => {
    expect(name("  Treasury   Operations ")).toBe("Treasury Operations");
    expect(name("Sales & Business Development")).toBe("Sales & Business Development");
    expect(name("Credit (Retail)")).toBe("Credit (Retail)");
  });
  it("rejects short, long and odd names", () => {
    expect(name("A")).toBe("Enter at least 2 characters");
    expect(name("   ")).toBe("Enter at least 2 characters");
    expect(name("x".repeat(49))).toBe("Keep the name under 48 characters");
    expect(name("Sales <b>")).toMatch(/^Use letters, numbers/);
    expect(name("123")).toBe("The name needs at least one letter");
  });
});

describe("categoryKey", () => {
  it("treats case, spacing, punctuation and & vs and as the same", () => {
    expect(categoryKey("Sales & Business Development")).toBe(categoryKey("sales  and business development"));
    expect(categoryKey("Compliance & Risk")).toBe(categoryKey("compliance-and-risk"));
    expect(categoryKey("Credit (Retail)")).toBe(categoryKey("credit retail"));
    expect(categoryKey("Operations")).not.toBe(categoryKey("Operation"));
  });
});
