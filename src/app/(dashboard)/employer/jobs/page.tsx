import Link from "next/link";
import type { Metadata } from "next";
import { PlusCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { JobStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { CloseJobButton } from "@/features/employers/close-job-button";
import { getEmployerContext, getEmployerJobs } from "@/features/employers/queries";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "My jobs", robots: { index: false } };

export default async function EmployerJobsPage() {
  const session = await auth();
  const ctx = await getEmployerContext(session!.user.id);
  if (!ctx) return <EmptyState title="Company not found" body="Your account isn't linked to a company yet. Contact support to get set up." />;

  const jobs = await getEmployerJobs(ctx.companyId);

  return (
    <>
      <PageHeader
        title="My jobs"
        description={`Every role ${ctx.company.name} has posted — drafts in review, live listings and closed ones.`}
        actions={
          <Link
            href="/employer/jobs/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-strong"
          >
            <PlusCircle className="size-3.5" aria-hidden />
            Post a job
          </Link>
        }
      />
      {jobs.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title="No jobs yet"
          body="Post your first job — our team reviews it and it usually goes live within one business day."
          cta={{ label: "Post your first job", href: "/employer/jobs/new" }}
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH>Applications</TH>
              <TH>Posted</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {jobs.map((job) => (
                <TR key={job.id}>
                  <TD className="font-semibold text-foreground">
                    {job.status === "PUBLISHED" ? (
                      <Link href={`/jobs/${job.slug}`} className="hover:text-primary">
                        {job.title}
                      </Link>
                    ) : (
                      job.title
                    )}
                    <span className="block text-[12px] font-normal text-faint">
                      {job.department.name} · {job.location}
                    </span>
                  </TD>
                  <TD>
                    <JobStatusBadge status={job.status} />
                  </TD>
                  <TD style={{ fontVariantNumeric: "tabular-nums" }}>
                    {job._count.applications > 0 ? (
                      <Link href={`/employer/applications?job=${job.id}`} className="font-semibold text-primary hover:underline">
                        {job._count.applications}
                      </Link>
                    ) : (
                      0
                    )}
                  </TD>
                  <TD>{formatDate(job.publishedAt ?? job.createdAt, { day: "numeric", month: "short", year: "numeric" })}</TD>
                  <TD className="text-right">
                    <span className="inline-flex items-center gap-3.5">
                      <Link href={`/employer/jobs/${job.id}/edit`} className="text-[13px] font-semibold text-primary hover:underline">
                        Edit
                      </Link>
                      {(job.status === "PUBLISHED" || job.status === "DRAFT") && <CloseJobButton jobId={job.id} jobTitle={job.title} />}
                    </span>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableShell>
      )}
    </>
  );
}
