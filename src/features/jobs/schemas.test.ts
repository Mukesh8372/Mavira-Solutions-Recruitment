import { describe, expect, it } from "vitest";
import { applyInputFromFormData, applySchema, normalizeIndianMobile } from "@/features/jobs/schemas";
import { formatDateOnly, dateOfBirthForAge } from "@/features/jobs/options";

const today = new Date();
const dobForAge = (age: number) => formatDateOnly(dateOfBirthForAge(age, today));

const valid = {
  jobId: "job_1",
  name: "Priya Sharma",
  email: "Priya.Sharma@Example.com",
  phone: "98765 43210",
  dateOfBirth: dobForAge(30),
  qualification: "Graduate",
  currentCity: "Thane",
  currentCompany: "",
  currentDesignation: "Relationship Manager",
  experienceYears: "5",
  currentCtcLpa: "6.5",
  expectedCtcLpa: "8",
  noticePeriodDays: "30",
  skills: "Sales, CASA, sales , Wealth Management",
  linkedinUrl: "https://www.linkedin.com/in/priya-sharma",
  coverNote: "",
  consent: true,
  website: "",
};

const firstError = (input: Record<string, unknown>) => {
  const r = applySchema.safeParse(input);
  return r.success ? null : r.error.issues[0]?.message;
};

describe("normalizeIndianMobile", () => {
  it("accepts common Indian formats", () => {
    expect(normalizeIndianMobile("9876543210")).toBe("+919876543210");
    expect(normalizeIndianMobile("+91 98765 43210")).toBe("+919876543210");
    expect(normalizeIndianMobile("0091-9876543210")).toBe("+919876543210");
    expect(normalizeIndianMobile("919876543210")).toBe("+919876543210");
    expect(normalizeIndianMobile("09876543210")).toBe("+919876543210");
    expect(normalizeIndianMobile("(98765) 432-10")).toBe("+919876543210");
  });
  it("rejects landlines, short, long and foreign numbers", () => {
    expect(normalizeIndianMobile("02212345678")).toBeNull();
    expect(normalizeIndianMobile("5876543210")).toBeNull();
    expect(normalizeIndianMobile("987654321")).toBeNull();
    expect(normalizeIndianMobile("98765432100")).toBeNull();
    expect(normalizeIndianMobile("+1 415 555 2671")).toBeNull();
    expect(normalizeIndianMobile("98765abcde")).toBeNull();
    expect(normalizeIndianMobile("")).toBeNull();
  });
});

describe("applySchema", () => {
  it("accepts a valid application and normalises values", () => {
    const r = applySchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.email).toBe("priya.sharma@example.com");
    expect(r.data.phone).toBe("+919876543210");
    expect(r.data.dateOfBirth).toBeInstanceOf(Date);
    expect(r.data.currentCompany).toBeUndefined();
    expect(r.data.coverNote).toBeUndefined();
    expect(r.data.currentCtcLpa).toBe(6.5);
    expect(r.data.expectedCtcLpa).toBe(8);
    expect(r.data.experienceYears).toBe(5);
    expect(r.data.noticePeriodDays).toBe(30);
    expect(r.data.skills).toEqual(["Sales", "CASA", "Wealth Management"]);
  });

  it("requires consent", () => {
    expect(firstError({ ...valid, consent: false })).toMatch(/privacy policy/);
    expect(firstError({ ...valid, consent: "true" })).toMatch(/privacy policy/);
  });

  it("checks the phone number", () => {
    expect(firstError({ ...valid, phone: "12345" })).toBe("Enter a 10-digit Indian mobile number");
  });

  it("checks the age range from the date of birth", () => {
    expect(firstError({ ...valid, dateOfBirth: dobForAge(18) })).toBeNull();
    expect(firstError({ ...valid, dateOfBirth: dobForAge(65) })).toBeNull();
    expect(firstError({ ...valid, dateOfBirth: dobForAge(17) })).toMatch(/between 18 and 65/);
    expect(firstError({ ...valid, dateOfBirth: dobForAge(66) })).toMatch(/between 18 and 65/);
    expect(firstError({ ...valid, dateOfBirth: "2026-02-30" })).toMatch(/YYYY-MM-DD/);
    expect(firstError({ ...valid, dateOfBirth: "" })).toMatch(/YYYY-MM-DD/);
  });

  it("restricts qualification, city and notice period to the lists", () => {
    expect(firstError({ ...valid, qualification: "PhD" })).toBe("Choose your highest qualification");
    expect(firstError({ ...valid, currentCity: "Paris" })).toBe("Choose your current city");
    expect(firstError({ ...valid, noticePeriodDays: "45" })).toBe("Choose your notice period");
    expect(firstError({ ...valid, noticePeriodDays: "" })).toBe("Choose your notice period");
  });

  it("checks experience and CTC formats", () => {
    expect(firstError({ ...valid, experienceYears: "5.5" })).toBe("Enter whole years");
    expect(firstError({ ...valid, experienceYears: "51" })).toMatch(/50 years or less/);
    expect(firstError({ ...valid, experienceYears: "" })).toMatch(/experience/i);
    expect(firstError({ ...valid, expectedCtcLpa: "" })).toMatch(/LPA/);
    expect(firstError({ ...valid, expectedCtcLpa: "8.25" })).toMatch(/LPA/);
    expect(firstError({ ...valid, expectedCtcLpa: "1000.1" })).toMatch(/1000 LPA or less/);
    expect(firstError({ ...valid, currentCtcLpa: "abc" })).toMatch(/LPA/);
    expect(firstError({ ...valid, currentCtcLpa: "" })).toBeNull();
  });

  it("checks the LinkedIn URL", () => {
    expect(firstError({ ...valid, linkedinUrl: "" })).toBeNull();
    expect(firstError({ ...valid, linkedinUrl: "https://linkedin.com/in/x" })).toBeNull();
    expect(firstError({ ...valid, linkedinUrl: "http://www.linkedin.com/in/x" })).toMatch(/LinkedIn/);
    expect(firstError({ ...valid, linkedinUrl: "https://linkedin.com.evil.com/in/x" })).toMatch(/LinkedIn/);
    expect(firstError({ ...valid, linkedinUrl: "https://www.linkedin.com/in/x?a=<script>" })).toMatch(/LinkedIn/);
  });

  it("limits skills and cover note", () => {
    const eleven = Array.from({ length: 11 }, (_, i) => `skill${i}`).join(",");
    expect(firstError({ ...valid, skills: eleven })).toBe("List up to 10 skills");
    expect(firstError({ ...valid, skills: "x".repeat(41) })).toBe("Each skill must be under 40 characters");
    expect(firstError({ ...valid, coverNote: "x".repeat(1201) })).toMatch(/under 1200/);
  });

  it("lets the honeypot through validation so the action can drop it silently", () => {
    expect(firstError({ ...valid, website: "" })).toBeNull();
    expect(firstError({ ...valid, website: "http://spam" })).not.toBeNull();
  });
});

describe("applyInputFromFormData", () => {
  it("maps text fields and the consent checkbox", () => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(valid)) {
      if (k === "consent") continue;
      fd.set(k, String(v));
    }
    fd.set("consent", "on");
    fd.set("resume", new File(["x"], "r.pdf"));
    const input = applyInputFromFormData(fd);
    expect(input.consent).toBe(true);
    expect(input.resume).toBeUndefined();
    expect(applySchema.safeParse(input).success).toBe(true);
    fd.delete("consent");
    expect(applyInputFromFormData(fd).consent).toBe(false);
  });
});
