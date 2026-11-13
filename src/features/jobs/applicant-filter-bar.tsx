import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AGE_MAX, AGE_MIN, EXPERIENCE_MAX, NOTICE_PERIODS, QUALIFICATIONS, noticePeriodLabel } from "@/features/jobs/options";
import { APPLICATION_STATUSES } from "@/features/jobs/admin-schemas";
import { activeApplicantFilterCount, type ApplicantFilters } from "@/features/jobs/applicant-filters";
import { labelApplicationStatus } from "@/lib/format";

type Option = { id: string; name: string };

/**
 * Plain GET form: every filter is a query parameter, so the view can be bookmarked
 * and works without JavaScript. Submitting resets to page 1 (no `page` input).
 */
export function ApplicantFilterBar({
  filters,
  jobs,
  categories,
  cities,
}: {
  filters: ApplicantFilters;
  jobs: { id: string; title: string; location: string }[];
  categories: Option[];
  cities: { city: string; count: number }[];
}) {
  // Keep a city from the URL selectable even when no applicant has it any more.
  const cityOptions =
    filters.city && !cities.some((c) => c.city.toLowerCase() === filters.city!.toLowerCase())
      ? [...cities, { city: filters.city, count: 0 }]
      : cities;
  const selectedCity = cityOptions.find((c) => c.city.toLowerCase() === filters.city?.toLowerCase())?.city ?? "";
  const active = activeApplicantFilterCount(filters);
  return (
    <form method="get" action="/admin/applications" className="mb-5 rounded-card border border-line bg-surface p-4 shadow-soft" aria-label="Filter applications">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor="f-q">Search</Label>
          <Input id="f-q" name="q" defaultValue={filters.q ?? ""} maxLength={80} placeholder="Name, email, phone, company, designation or skill" />
        </div>
        <div>
          <Label htmlFor="f-job">Job</Label>
          <Select id="f-job" name="job" defaultValue={filters.job ?? ""}>
            <option value="">All jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} · {j.location}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-category">Role category</Label>
          <Select id="f-category" name="category" defaultValue={filters.category ?? ""}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-status">Status</Label>
          <Select id="f-status" name="status" defaultValue={filters.status ?? ""}>
            <option value="">Any status</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {labelApplicationStatus(s)}
              </option>
            ))}
          </Select>
        </div>
        <RangePair label="Age" minName="ageMin" maxName="ageMax" min={AGE_MIN} max={AGE_MAX} minValue={filters.ageMin} maxValue={filters.ageMax} />
        <RangePair label="Experience (years)" minName="expMin" maxName="expMax" min={0} max={EXPERIENCE_MAX} minValue={filters.expMin} maxValue={filters.expMax} />
        <RangePair label="Expected CTC (LPA)" minName="ctcMin" maxName="ctcMax" min={0} max={1000} step="0.1" minValue={filters.ctcMin} maxValue={filters.ctcMax} />
        <div>
          <Label htmlFor="f-city">City</Label>
          <Select id="f-city" name="city" defaultValue={selectedCity}>
            <option value="">Any city</option>
            {cityOptions.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.count})
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-qualification">Qualification</Label>
          <Select id="f-qualification" name="qualification" defaultValue={filters.qualification ?? ""}>
            <option value="">Any qualification</option>
            {QUALIFICATIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-notice">Notice period</Label>
          <Select id="f-notice" name="notice" defaultValue={filters.notice === undefined ? "" : String(filters.notice)}>
            <option value="">Any</option>
            {NOTICE_PERIODS.map((d) => (
              <option key={d} value={d}>
                {noticePeriodLabel(d)}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="f-from">Applied from</Label>
            <Input id="f-from" name="from" type="date" defaultValue={filters.from ?? ""} />
          </div>
          <div>
            <Label htmlFor="f-to">Applied to</Label>
            <Input id="f-to" name="to" type="date" defaultValue={filters.to ?? ""} />
          </div>
        </div>
        <div>
          <Label htmlFor="f-sort">Sort</Label>
          <Select id="f-sort" name="sort" defaultValue={filters.sort}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="experience">Most experience</option>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        {active > 0 && (
          <Link href="/admin/applications" className="text-[13px] font-semibold text-primary hover:underline">
            Clear {active} filter{active === 1 ? "" : "s"}
          </Link>
        )}
      </div>
    </form>
  );
}

function RangePair({ label, minName, maxName, min, max, step, minValue, maxValue }: { label: string; minName: string; maxName: string; min: number; max: number; step?: string; minValue?: number; maxValue?: number }) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-[13.5px] font-semibold text-foreground">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <Input name={minName} type="number" inputMode="numeric" min={min} max={max} step={step} placeholder="Min" aria-label={`${label} minimum`} defaultValue={minValue ?? ""} />
        <Input name={maxName} type="number" inputMode="numeric" min={min} max={max} step={step} placeholder="Max" aria-label={`${label} maximum`} defaultValue={maxValue ?? ""} />
      </div>
    </fieldset>
  );
}
