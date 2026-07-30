import Link from "next/link";
import type { Metadata } from "next";
import type { ApplicationStatus } from "@prisma/client";
import { FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StatusSelect } from "@/features/employers/status-select";
import { getEmployerContext, getEmployerJobs, getEmployerApplications } from "@/features/employers/queries";
import { formatDate, labelApplicationStatus } from "@/lib/format";

export const metadata: Metadata = { title: "Applications", robots: { index: false } };

const allStatuses: ApplicationStatus[] = ["APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW", "OFFERED", "PLACED", "REJECTED", "WITHDRAWN"];

export default async function EmployerApplicationsPage(props: {
  searchParams: Promise<{ job?: string; status?: string }>;
}) {
  const { job, status } = await props.searchParams;
  const session = await auth();
  const ctx = await getEmployerContext(session!.user.id);
  if (!ctx) return <EmptyState title="Company not found" body="Your account isn't linked to a company yet. Contact support to get set up." />;

  const statusFilter = allStatuses.includes(status as ApplicationStatus) ? (status as ApplicationStatus) : undefined;
  const jobs = await getEmployerJobs(ctx.companyId);
  const jobFilter = jobs.some((j) => j.id === job) ? job : undefined;
  const applications = await getEmployerApplications(ctx.companyId, { jobId: jobFilter, status: statusFilter });
  const filtered = Boolean(jobFilter || statusFilter);

  return (
    <>
      <PageHeader title="Applications" description="Review candidates, move them through the pipeline and schedule interviews." />

      <form method="get" className="mb-5 flex flex-wrap items-end gap-3" aria-label="Filter applications">
        <div className="w-full sm:w-64">
          <Label htmlFor="filter-job">Job</Label>
          <Select id="filter-job" name="job" defaultValue={jobFilter ?? ""}>
            <option value="">All jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="filter-status">Status</Label>
          <Select id="filter-status" name="status" defaultValue={statusFilter ?? ""}>
            <option value="">All statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {labelApplicationStatus(s)}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-btn border border-line bg-surface px-4 text-[13.5px] font-semibold text-foreground shadow-soft transition-colors hover:border-faint"
        >
          Apply filters
        </button>
        {filtered && (
          <Link href="/employer/applications" className="inline-flex h-11 items-center text-[13px] font-semibold text-primary hover:underline">
            Clear
          </Link>
        )}
      </form>

      {applications.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={filtered ? "Nothing matches these filters" : "No applications yet"}
          body={
            filtered
              ? "Try a different job or status, or clear the filters."
              : "Once your jobs go live, candidate applications land here for review."
          }
          cta={filtered ? { label: "Clear filters", href: "/employer/applications" } : { label: "Post a job", href: "/employer/jobs/new" }}
        />
      ) : (
        <TableShell>
          <Table className="min-w-[880px]">
            <THead>
              <TH>Candidate</TH>
              <TH>Role</TH>
              <TH>Applied</TH>
              <TH>Status</TH>
              <TH>Resume</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {applications.map((app) => (
                <TR key={app.id}>
                  <TD className="font-semibold text-foreground">
                    {app.candidate.user.name}
                    {app.candidate.headline && <span className="block max-w-52 truncate text-[12px] font-normal text-faint">{app.candidate.headline}</span>}
                  </TD>
                  <TD>{app.job.title}</TD>
                  <TD>{formatDate(app.createdAt, { day: "numeric", month: "short", year: "numeric" })}</TD>
                  <TD>
                    <ApplicationStatusBadge status={app.status} />
                  </TD>
                  <TD>
                    {app.resume ? (
                      <a
                        href={app.resume.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
                      >
                        <FileText className="size-3.5" aria-hidden />
                        View
                        <span className="sr-only"> resume of {app.candidate.user.name}</span>
                      </a>
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD className="text-right">
                    <span className="inline-flex items-center gap-3">
                      {app.status === "WITHDRAWN" ? (
                        <span className="text-[13px] text-faint">Withdrawn</span>
                      ) : (
                        <>
                          <StatusSelect applicationId={app.id} status={app.status} candidateName={app.candidate.user.name} />
                          <Link
                            href={`/employer/interviews/new?application=${app.id}`}
                            className="whitespace-nowrap text-[13px] font-semibold text-primary hover:underline"
                          >
                            Schedule interview
                            <span className="sr-only"> with {app.candidate.user.name}</span>
                          </Link>
                        </>
                      )}
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
