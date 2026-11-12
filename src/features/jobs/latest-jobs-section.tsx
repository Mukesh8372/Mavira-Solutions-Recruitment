import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { JobCard } from "@/features/jobs/job-card";
import { getLatestJobs } from "@/features/jobs/queries";

/** Homepage block. Renders nothing when there are no open jobs. */
export async function LatestJobsSection() {
  const jobs = await getLatestJobs(6);
  if (jobs.length === 0) return null;
  return (
    <section className="container-site py-20 md:py-28" aria-labelledby="latest-jobs-heading">
      <SectionHeading
        eyebrow="Current openings"
        title="Roles we are hiring for right now"
        lead="BFSI and broking positions from our client desks. Apply in a few minutes — no fees for candidates."
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
          href="/jobs"
          className="inline-flex h-11 items-center gap-2 rounded-btn border border-line bg-surface px-6 text-[14.5px] font-semibold text-foreground shadow-soft transition-colors hover:border-primary hover:text-primary"
        >
          View all openings
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Reveal>
    </section>
  );
}
