import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { JobCard } from "@/features/jobs/job-card";
import { getJobsByIndustry } from "@/features/jobs/queries";

/** Industry page block. Renders nothing when the industry has no open jobs. */
export async function IndustryJobsSection({ industrySlug, industryName }: { industrySlug: string; industryName: string }) {
  const jobs = await getJobsByIndustry(industrySlug, 6);
  if (jobs.length === 0) return null;
  return (
    <section className="container-site py-20 md:py-24" aria-labelledby="industry-jobs-heading">
      <SectionHeading
        eyebrow="Open roles"
        title={`Current ${industryName} openings`}
        lead="Live positions from our client desks in this sector."
      />
      <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <RevealItem as="li" key={job.id}>
            <JobCard job={job} />
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal className="mt-10 text-center">
        <Link
          href={`/jobs?industry=${industrySlug}`}
          className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline"
        >
          All {industryName} jobs
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Reveal>
    </section>
  );
}
