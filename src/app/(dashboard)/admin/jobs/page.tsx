import Link from "next/link";
import type { Metadata } from "next";
import type { JobStatus } from "@prisma/client";
import { PageHeader } from "@/components/dashboard/page-header";
import { JobStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { FilterTabs } from "@/features/admin/filter-tabs";
import { JobFlagToggles, JobStatusButtons } from "@/features/admin/job-actions";
import { getAdminJobs } from "@/features/admin/queries";
import { formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Jobs — Admin", robots: { index: false } };

const statusTabs: { label: string; value?: JobStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Closed", value: "CLOSED" },
];

export default async function AdminJobsPage(props: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await props.searchParams;
  const active = statusTabs.find((t) => t.value && t.value.toLowerCase() === status?.toLowerCase())?.value;
  const jobs = await getAdminJobs(active);

  return (
    <>
      <PageHeader title="Jobs" description="Publish, close and flag roles across all companies." />
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
          body="Jobs posted by employers or staff will appear here for review and publishing."
        />
      ) : (
        <TableShell>
          <Table className="min-w-[960px]">
            <THead>
              <TH>Role</TH>
              <TH>Company</TH>
              <TH>Department</TH>
              <TH>Status</TH>
              <TH>Flags</TH>
              <TH>Applications</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {jobs.map((job) => (
                <TR key={job.id} className={job.status === "DRAFT" ? "bg-warning/[0.04]" : undefined}>
                  <TD className="font-semibold text-foreground">
                    {job.title}
                    <span className="block text-[12px] font-normal text-faint">Updated {formatRelativeDate(job.updatedAt)}</span>
                  </TD>
                  <TD>{job.company.name}</TD>
                  <TD>{job.department.name}</TD>
                  <TD>
                    <JobStatusBadge status={job.status} />
                  </TD>
                  <TD>
                    <JobFlagToggles jobId={job.id} featured={job.featured} urgent={job.urgent} />
                  </TD>
                  <TD>{job._count.applications}</TD>
                  <TD className="text-right">
                    <span className="inline-flex items-center gap-3">
                      <JobStatusButtons jobId={job.id} status={job.status} />
                      <Link href={`/jobs/${job.slug}`} className="text-[13px] font-semibold text-primary hover:underline">
                        View
                      </Link>
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
