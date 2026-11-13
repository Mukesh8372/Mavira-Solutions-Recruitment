import Link from "next/link";
import type { Metadata } from "next";
import type { JobStatus } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { JobStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { FilterTabs } from "@/features/admin/filter-tabs";
import { JobFlagToggles, JobStatusButtons } from "@/features/jobs/job-admin-actions";
import { getAdminJobs } from "@/features/admin/queries";
import { isJobOpen } from "@/features/jobs/display";
import { formatDate, formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Jobs — Admin", robots: { index: false } };

const statusTabs: { label: string; value?: JobStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Archived", value: "ARCHIVED" },
];

export default async function AdminJobsPage(props: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await props.searchParams;
  const active = statusTabs.find((t) => t.value && t.value.toLowerCase() === status?.toLowerCase())?.value;
  const jobs = await getAdminJobs(active);

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Post roles, publish them to the website and track applications."
        actions={
          <Link href="/admin/jobs/new" className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-strong">
            <PlusCircle className="size-4" aria-hidden />
            Post a job
          </Link>
        }
      />
      <FilterTabs
        label="Filter jobs by status"
        tabs={statusTabs.map((t) => ({
          label: t.label,
          href: t.value ? `/admin/jobs?status=${t.value.toLowerCase()}` : "/admin/jobs",
          active: t.value === active,
        }))}
      />
      {jobs.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title={active ? `No ${active.toLowerCase()} jobs` : "No jobs yet"}
          body="Post a job and publish it to list it on the website."
          cta={{ label: "Post a job", href: "/admin/jobs/new" }}
        />
      ) : (
        <TableShell>
          <Table className="min-w-[1080px]">
            <THead>
              <TH>Role</TH>
              <TH>Hiring company</TH>
              <TH>Category</TH>
              <TH>Status</TH>
              <TH>Apply by</TH>
              <TH>Flags</TH>
              <TH>Applications</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {jobs.map((job) => {
                const expired = job.status === "PUBLISHED" && !isJobOpen(job);
                return (
                  <TR key={job.id} className={job.status === "DRAFT" ? "bg-warning/[0.04]" : undefined}>
                    <TD className="font-semibold text-foreground">
                      {job.title}
                      <span className="block text-[12px] font-normal text-faint">
                        {job.location} · updated {formatRelativeDate(job.updatedAt)}
                      </span>
                    </TD>
                    <TD>{job.employerLabel}</TD>
                    <TD>{job.department.name}</TD>
                    <TD>
                      <JobStatusBadge status={job.status} />
                      {expired && <span className="block text-[12px] text-destructive">Past apply-by date</span>}
                    </TD>
                    <TD>{job.validThrough ? formatDate(job.validThrough, { day: "numeric", month: "short", year: "numeric" }) : "—"}</TD>
                    <TD>
                      <JobFlagToggles jobId={job.id} featured={job.featured} urgent={job.urgent} />
                    </TD>
                    <TD>
                      <Link href={`/admin/applications?job=${job.id}`} className="font-semibold text-primary hover:underline">
                        {job._count.publicApplications}
                      </Link>
                    </TD>
                    <TD className="text-right">
                      <span className="inline-flex flex-wrap items-center justify-end gap-3">
                        <Link href={`/admin/jobs/${job.id}/edit`} className="text-[13px] font-semibold text-primary hover:underline">
                          Edit
                        </Link>
                        <JobStatusButtons jobId={job.id} status={job.status} />
                        {job.status !== "DRAFT" && job.status !== "ARCHIVED" && (
                          <Link href={`/jobs/${job.slug}`} className="text-[13px] font-semibold text-body hover:underline" target="_blank">
                            View
                          </Link>
                        )}
                      </span>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableShell>
      )}
    </>
  );
}
