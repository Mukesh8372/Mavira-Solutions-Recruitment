import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, PlusCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { getEmployerOverview } from "@/features/employers/queries";
import { formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Employer dashboard", robots: { index: false } };

export default async function EmployerOverviewPage() {
  const session = await auth();
  const data = await getEmployerOverview(session!.user.id);
  if (!data) return <EmptyState title="Company not found" body="Your account isn't linked to a company yet. Contact support to get set up." />;

  const { company, jobCounts, totalApplications, applicationsThisWeek, upcomingInterviewCount, recentApplications } = data;

  return (
    <>
      <PageHeader
        title={`Hiring at ${company.name}`}
        description="Your pipeline at a glance — jobs, applications and interviews."
        actions={
          <>
            <Link
              href="/employer/jobs/new"
              className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-strong"
            >
              <PlusCircle className="size-3.5" aria-hidden />
              Post a job
            </Link>
            <Link
              href="/employer/applications"
              className="inline-flex h-10 items-center gap-1.5 rounded-btn border border-line bg-surface px-4 text-[13.5px] font-semibold text-foreground shadow-soft transition-colors hover:border-faint"
            >
              Review applications
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active jobs" value={jobCounts.PUBLISHED ?? 0} icon="briefcase" tone="primary" hint={jobCounts.DRAFT ? `${jobCounts.DRAFT} in review` : undefined} />
        <StatCard label="Total applications" value={totalApplications} icon="inbox" tone="secondary" />
        <StatCard label="New this week" value={applicationsThisWeek} icon="file-text" tone="accent" />
        <StatCard label="Upcoming interviews" value={upcomingInterviewCount} icon="calendar" tone="warning" />
      </div>

      <section aria-labelledby="recent-apps-heading" className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-apps-heading" className="text-[16px] font-bold">
            Recent applications
          </h2>
          <Link href="/employer/applications" className="text-[13px] font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {recentApplications.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="No applications yet"
            body="Once your jobs go live, candidate applications land here for review."
            cta={{ label: "Post a job", href: "/employer/jobs/new" }}
          />
        ) : (
          <TableShell>
            <Table>
              <THead>
                <TH>Candidate</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Applied</TH>
              </THead>
              <TBody>
                {recentApplications.map((app) => (
                  <TR key={app.id}>
                    <TD className="font-semibold text-foreground">
                      <Link href={`/employer/applications?job=${app.jobId}`} className="hover:text-primary">
                        {app.candidate.user.name}
                      </Link>
                    </TD>
                    <TD>{app.job.title}</TD>
                    <TD>
                      <ApplicationStatusBadge status={app.status} />
                    </TD>
                    <TD>{formatRelativeDate(app.createdAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableShell>
        )}
      </section>
    </>
  );
}
