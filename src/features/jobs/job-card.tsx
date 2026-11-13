import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatExperience, formatRelativeDate, formatSalaryRange, labelEmploymentType, labelWorkMode } from "@/lib/format";
import type { JobWithRelations } from "@/features/jobs/queries";

export function JobCard({ job }: { job: JobWithRelations }) {
  const salary = job.salaryVisible ? formatSalaryRange(job.salaryMin, job.salaryMax) : null;
  return (
    <Card hover className="relative flex h-full flex-col p-5">
      <div className="min-w-0">
        <h3 className="text-[16.5px] font-bold leading-snug">
          {/* Stretched link: the whole card is clickable. */}
          <Link href={`/jobs/${job.slug}`} className="transition-colors after:absolute after:inset-0 hover:text-primary">
            {job.title}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-body">
          <span className="inline-flex items-center gap-1">
            <Building2 className="size-3.5 text-faint" aria-hidden />
            {job.employerLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 text-faint" aria-hidden />
            {job.location}
          </span>
        </p>
      </div>

      <div className="mb-5 mt-4 flex flex-wrap gap-1.5">
        <Badge variant="blue">{labelEmploymentType(job.employmentType)}</Badge>
        <Badge variant="purple">{labelWorkMode(job.workMode)}</Badge>
        <Badge variant="green">{formatExperience(job.experienceMin, job.experienceMax)}</Badge>
        {job.urgent && <Badge variant="red">Urgent</Badge>}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
        <span className="font-mono text-[14px] font-semibold text-accent" style={{ fontVariantNumeric: "tabular-nums" }}>
          {salary ?? "Salary on request"}
        </span>
        <span className="text-[12.5px] text-faint">{formatRelativeDate(job.publishedAt ?? job.createdAt)}</span>
      </div>
    </Card>
  );
}
