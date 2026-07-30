import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { WithdrawButton } from "@/features/candidates/withdraw-button";
import { getCandidateApplications } from "@/features/candidates/queries";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "My applications", robots: { index: false } };

export default async function ApplicationsPage() {
  const session = await auth();
  const applications = await getCandidateApplications(session!.user.id);

  return (
    <>
      <PageHeader title="My applications" description="Every application, with its live status — no black holes." />
      {applications.length === 0 ? (
        <EmptyState
          icon="file-text"
          title="No applications yet"
          body="Apply to a role and track it here through screening, shortlist, interview and offer."
          cta={{ label: "Browse open roles", href: "/jobs" }}
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TH>Role</TH>
              <TH>Company</TH>
              <TH>Applied</TH>
              <TH>Status</TH>
              <TH>Next interview</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {applications.map((app) => {
                const nextInterview = app.interviews.find((iv) => iv.status === "SCHEDULED" && iv.scheduledAt > new Date());
                const withdrawable = !["PLACED", "REJECTED", "WITHDRAWN"].includes(app.status);
                return (
                  <TR key={app.id}>
                    <TD className="font-semibold text-foreground">
                      <Link href={`/jobs/${app.job.slug}`} className="hover:text-primary">
                        {app.job.title}
                      </Link>
                      <span className="block text-[12px] font-normal text-faint">{app.job.department.name}</span>
                    </TD>
                    <TD>{app.job.company.name}</TD>
                    <TD>{formatDate(app.createdAt, { day: "numeric", month: "short", year: "numeric" })}</TD>
                    <TD>
                      <ApplicationStatusBadge status={app.status} />
                    </TD>
                    <TD>{nextInterview ? formatDateTime(nextInterview.scheduledAt) : "—"}</TD>
                    <TD className="text-right">{withdrawable ? <WithdrawButton applicationId={app.id} /> : "—"}</TD>
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
