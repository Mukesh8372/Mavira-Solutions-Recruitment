import { describe, expect, it } from "vitest";
import { activeApplicantFilterCount, applicantFiltersToParams, applicantsHref, parseApplicantFilters } from "@/features/jobs/applicant-filters";

describe("parseApplicantFilters", () => {
  it("reads valid values and drops bad ones", () => {
    const f = parseApplicantFilters({
      job: "cm123",
      status: "SHORTLISTED",
      ageMin: "25",
      ageMax: "70",
      expMin: "x",
      expMax: "10",
      ctcMin: "6.5",
      ctcMax: "6.55",
      city: "Thane",
      qualification: "PhD",
      notice: "30",
      from: "2026-11-01",
      to: "2026-13-01",
      q: " sales ",
      sort: "experience",
      page: "2",
    });
    expect(f).toEqual({
      job: "cm123",
      category: undefined,
      status: "SHORTLISTED",
      ageMin: 25,
      ageMax: undefined,
      expMin: undefined,
      expMax: 10,
      ctcMin: 6.5,
      ctcMax: undefined,
      city: "Thane",
      qualification: undefined,
      notice: 30,
      from: "2026-11-01",
      to: undefined,
      q: "sales",
      sort: "experience",
      page: 2,
    });
  });
  it("rejects a notice period outside the list and defaults sort and page", () => {
    const f = parseApplicantFilters({ notice: "45", sort: "oldest", page: "0" });
    expect(f.notice).toBeUndefined();
    expect(f.sort).toBe("oldest");
    expect(f.page).toBe(1);
  });
  it("serialises back to the URL and counts active filters", () => {
    const f = parseApplicantFilters({ status: "APPLIED", city: "Pune", page: "3", sort: "oldest" });
    expect(applicantFiltersToParams(f).toString()).toBe("status=APPLIED&city=Pune&sort=oldest&page=3");
    expect(applicantsHref(f, 1)).toBe("/admin/applications?status=APPLIED&city=Pune&sort=oldest");
    expect(activeApplicantFilterCount(f)).toBe(2);
    expect(applicantsHref(parseApplicantFilters({}))).toBe("/admin/applications");
  });
});
