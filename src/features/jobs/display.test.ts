import { describe, expect, it } from "vitest";
import { isJobOpen, jobFiltersToParams, jobsHref, parseJobFilters } from "@/features/jobs/display";

describe("parseJobFilters", () => {
  it("reads valid values and drops bad ones", () => {
    const f = parseJobFilters({
      q: "  Relationship Manager ",
      location: "Thane",
      category: "wealth-management",
      industry: "Bad Slug!",
      experience: "3-5",
      type: ["FULL_TIME", "NOPE"],
      mode: "REMOTE",
      sort: "salary",
      page: "3",
    });
    expect(f).toEqual({
      q: "Relationship Manager",
      location: "Thane",
      category: "wealth-management",
      industry: undefined,
      experience: "3-5",
      type: ["FULL_TIME"],
      mode: ["REMOTE"],
      sort: "salary",
      page: 3,
    });
  });
  it("defaults to newest and page 1", () => {
    const f = parseJobFilters({ sort: "relevance", page: "0", experience: "9-10" });
    expect(f.sort).toBe("newest");
    expect(f.page).toBe(1);
    expect(f.experience).toBeUndefined();
  });
  it("round-trips through jobFiltersToParams and omits page 1", () => {
    const f = parseJobFilters({ q: "sales", type: ["FULL_TIME", "CONTRACT"], page: "2" });
    expect(jobFiltersToParams(f).toString()).toBe("q=sales&type=FULL_TIME&type=CONTRACT&page=2");
    expect(jobsHref(f, 1)).toBe("/jobs?q=sales&type=FULL_TIME&type=CONTRACT");
    expect(jobsHref(parseJobFilters({}))).toBe("/jobs");
  });
});

describe("isJobOpen", () => {
  const now = new Date("2026-11-12T10:00:00Z");
  it("requires PUBLISHED and a future or empty apply-by date", () => {
    expect(isJobOpen({ status: "PUBLISHED", validThrough: null }, now)).toBe(true);
    expect(isJobOpen({ status: "PUBLISHED", validThrough: new Date("2026-11-13T00:00:00Z") }, now)).toBe(true);
    expect(isJobOpen({ status: "PUBLISHED", validThrough: new Date("2026-11-12T09:59:59Z") }, now)).toBe(false);
    expect(isJobOpen({ status: "CLOSED", validThrough: null }, now)).toBe(false);
    expect(isJobOpen({ status: "DRAFT", validThrough: null }, now)).toBe(false);
  });
});
