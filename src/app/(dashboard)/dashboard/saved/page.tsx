import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { JobCard } from "@/features/jobs/job-card";
import { getCandidateSavedJobs } from "@/features/candidates/queries";

export const metadata: Metadata = { title: "Saved jobs", robots: { index: false } };

export default async function SavedJobsPage() {
  const session = await auth();
  const saved = await getCandidateSavedJobs(session!.user.id);

  return (
    <>
      <PageHeader title="Saved jobs" description="Your shortlist. Roles stay here until you unsave them or they close." />
      {saved.length === 0 ? (
        <EmptyState
          icon="heart"
          title="Nothing saved yet"
          body="Tap the heart on any job to build your shortlist."
          cta={{ label: "Browse open roles", href: "/jobs" }}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {saved.map((s) => (
            <li key={s.id}>
              <JobCard job={s.job} saved />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
