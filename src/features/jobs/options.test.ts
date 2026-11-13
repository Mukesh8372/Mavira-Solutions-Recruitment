import { describe, expect, it } from "vitest";
import { ageOn, dateOfBirthForAge, formatDateOnly, normalizeCity, parseDateOnly } from "@/features/jobs/options";

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

describe("parseDateOnly", () => {
  it("parses a real date at 00:00 UTC", () => {
    expect(parseDateOnly("1995-08-15")?.toISOString()).toBe("1995-08-15T00:00:00.000Z");
  });
  it("rejects impossible and malformed dates", () => {
    expect(parseDateOnly("2026-02-30")).toBeNull();
    expect(parseDateOnly("2026-13-01")).toBeNull();
    expect(parseDateOnly("15-08-1995")).toBeNull();
    expect(parseDateOnly("1995-8-15")).toBeNull();
    expect(parseDateOnly("")).toBeNull();
  });
  it("round-trips through formatDateOnly", () => {
    expect(formatDateOnly(parseDateOnly("2000-02-29")!)).toBe("2000-02-29");
  });
});

describe("ageOn", () => {
  it("counts whole years across the birthday boundary", () => {
    const dob = utc(2000, 6, 15);
    expect(ageOn(dob, utc(2026, 6, 14))).toBe(25);
    expect(ageOn(dob, utc(2026, 6, 15))).toBe(26);
    expect(ageOn(dob, utc(2026, 6, 16))).toBe(26);
  });
  it("handles a 29 February birthday", () => {
    const dob = utc(2000, 2, 29);
    expect(ageOn(dob, utc(2026, 2, 28))).toBe(25);
    expect(ageOn(dob, utc(2026, 3, 1))).toBe(26);
  });
});

describe("dateOfBirthForAge", () => {
  it("returns the latest birth date that gives the age", () => {
    const on = utc(2026, 11, 12);
    const dob = dateOfBirthForAge(30, on);
    expect(formatDateOnly(dob)).toBe("1996-11-12");
    expect(ageOn(dob, on)).toBe(30);
    expect(ageOn(new Date(dob.getTime() + 86_400_000), on)).toBe(29);
  });
});

describe("normalizeCity", () => {
  it("matches a suggested city whatever the case or spacing", () => {
    expect(normalizeCity("thane")).toBe("Thane");
    expect(normalizeCity("NAVI MUMBAI")).toBe("Navi Mumbai");
    expect(normalizeCity("navimumbai")).toBe("Navi Mumbai");
    expect(normalizeCity("  Pune  ")).toBe("Pune");
  });
  it("maps old city names to the current name", () => {
    expect(normalizeCity("Bombay")).toBe("Mumbai");
    expect(normalizeCity("bangalore")).toBe("Bengaluru");
    expect(normalizeCity("Gurgaon")).toBe("Gurugram");
    expect(normalizeCity("calcutta")).toBe("Kolkata");
    expect(normalizeCity("Madras")).toBe("Chennai");
    expect(normalizeCity("poona")).toBe("Pune");
    expect(normalizeCity("Baroda")).toBe("Vadodara");
    expect(normalizeCity("cochin")).toBe("Kochi");
  });
  it("capitalises other cities word by word", () => {
    expect(normalizeCity("vapi")).toBe("Vapi");
    expect(normalizeCity("sawai   madhopur")).toBe("Sawai Madhopur");
    expect(normalizeCity("mira-bhayandar")).toBe("Mira-Bhayandar");
  });
  it("returns an empty string for blank input", () => {
    expect(normalizeCity("   ")).toBe("");
  });
});
