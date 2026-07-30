import Link from "next/link";
import type { Metadata } from "next";
import type { ApplicationStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { JobStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { getEmployerContext, getEmployerReportData } from "@/features/employers/queries";
import { formatDate, labelApplicationStatus } from "@/lib/format";

export const metadata: Metadata = { title: "Reports", robots: { index: false } };

const funnelOrder: ApplicationStatus[] = ["APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW", "OFFERED", "PLACED", "REJECTED", "WITHDRAWN"];

export default async function EmployerReportsPage() {
  const session = await auth();
  const ctx = await getEmployerContext(session!.user.id);
  if (!ctx) return <EmptyState title="Company not found" body="Your account isn't linked to a company yet. Contact support to get set up." />;

  const { funnel, jobs } = await getEmployerReportData(ctx.companyId);
  const totalApplications = funnelOrder.reduce((sum, s) => sum + (funnel[s] ?? 0), 0);
  const maxCount = Math.max(1, ...funnelOrder.map((s) => funnel[s] ?? 0));

  return (
    <>
      <PageHeader
        title="Reports"
        description={`All-time hiring data for ${ctx.company.name}, as of ${formatDate(new Date())}.`}
      />

      {totalApplications === 0 && jobs.length === 0 ? (
        <EmptyState
          icon="bar-chart"
          title="Nothing to report yet"
          body="Post a job and start receiving applications — your pipeline funnel and per-job numbers appear here."
          cta={{ label: "Post a job", href: "/employer/jobs/new" }}
        />
      ) : (
        <div className="space-y-8">
          <section aria-labelledby="funnel-heading" className="rounded-card border border-line bg-surface p-6 shadow-soft">
            <h2 id="funnel-heading" className="text-[16px] font-bold">
              Pipeline funnel
            </h2>
            <p className="mt-0.5 text-[13px] text-body">
              {totalApplications} application{totalApplications === 1 ? "" : "s"} across all statuses.
            </p>
            {totalApplications === 0 ? (
              <p className="mt-4 text-[14px] text-body">No applications yet — the funnel fills in as candidates apply.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {funnelOrder.map((status) => {
                  const count = funnel[status] ?? 0;
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <li key={status} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 text-[13.5px]">
                      <span className="text-body">{labelApplicationStatus(status)}</span>
                      <span
                        className="h-3.5 overflow-hidden rounded-[4px] bg-background-alt"
                        role="img"
                        aria-label={`${labelApplicationStatus(status)}: ${count} of ${totalApplications} applications`}
                      >
                        <span className="block h-full rounded-[4px] bg-primary" style={{ width: `${count === 0 ? 0 : Math.max(pct, 2)}%` }} />
                      </span>
                      <span className="text-right font-semibold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="per-job-heading">
            <h2 id="per-job-heading" className="mb-3 text-[16px] font-bold">
              Applications per job
            </h2>
            {jobs.length === 0 ? (
              <p className="text-[14px] text-body">No jobs posted yet.</p>
            ) : (
              <TableShell>
                <Table>
                  <THead>
                    <TH>Role</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Applications</TH>
                  </THead>
                  <TBody>
                    {jobs.map((job) => (
                      <TR key={job.id}>
                        <TD className="font-semibold text-foreground">
                          <Link href={`/employer/applications?job=${job.id}`} className="hover:text-primary">
                            {job.title}
                          </Link>
                          <span className="block text-[12px] font-normal text-faint">{job.location}</span>
                        </TD>
                        <TD>
                          <JobStatusBadge status={job.status} />
                        </TD>
                        <TD className="text-right font-semibold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {job._count.applications}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableShell>
            )}
          </section>
        </div>
      )}
    </>
  );
}
