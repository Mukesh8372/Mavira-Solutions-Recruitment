import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Plain GET form so search works without JavaScript. Submitting resets to
 * page 1 (no `page` input) while active filter params ride along as hidden inputs.
 */
export function JobSearchForm({
  q,
  location,
  locations,
  hiddenParams,
}: {
  q?: string;
  location?: string;
  locations: string[];
  hiddenParams: [name: string, value: string][];
}) {
  return (
    <form method="get" action="/jobs" role="search" aria-label="Search jobs" className="flex flex-col gap-2.5 sm:flex-row">
      {hiddenParams.map(([name, value], i) => (
        <input key={`${name}-${value}-${i}`} type="hidden" name={name} value={value} />
      ))}

      <div className="relative flex-1">
        <label htmlFor="jobs-q" className="sr-only">
          Search by role or keyword
        </label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
        <Input
          id="jobs-q"
          name="q"
          type="search"
          defaultValue={q}
          maxLength={80}
          placeholder="Role or keyword — e.g. Relationship Manager, Equity Dealer"
          className="pl-10"
        />
      </div>

      <div className="relative sm:w-64">
        <label htmlFor="jobs-location" className="sr-only">
          Location
        </label>
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
        <Input
          id="jobs-location"
          name="location"
          defaultValue={location}
          maxLength={60}
          placeholder="City"
          list="jobs-location-list"
          className="pl-10"
        />
        <datalist id="jobs-location-list">
          {locations.map((loc) => (
            <option key={loc} value={loc} />
          ))}
        </datalist>
      </div>

      <Button type="submit" className="sm:px-7">
        Search
      </Button>
    </form>
  );
}
