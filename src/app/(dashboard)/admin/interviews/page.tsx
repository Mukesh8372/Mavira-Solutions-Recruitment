import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { InterviewStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { getAdminInterviews } from "@/features/admin/queries";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Interviews — Admin", robots: { index: false } };

const modeLabels: Record<string, string> = { CALL: "Phone call", VIDEO: "Video", ONSITE: "On-site" };

export default async function AdminInterviewsPage() {
  const interviews = await getAdminInterviews();

  return (
    <>
      <PageHeader title="Interviews" description="Every scheduled round across all roles and companies." />
      {interviews.length === 0 ? (
        <EmptyState icon="calendar" title="No interviews yet" body="Interviews scheduled against applications will appear here." />
      ) : (
        <TableShell>
          <Table className="min-w-[820px]">
            <THead>
              <TH>Candidate</TH>
              <TH>Role</TH>
              <TH>Company</TH>
              <TH>When</TH>
              <TH>Mode</TH>
              <TH>Status</TH>
            </THead>
            <TBody>
              {interviews.map((interview) => (
                <TR key={interview.id}>
                  <TD className="font-semibold text-foreground">{interview.application.candidate.user.name}</TD>
                  <TD>{interview.application.job.title}</TD>
                  <TD>{interview.application.job.company.name}</TD>
                  <TD>{formatDateTime(interview.scheduledAt)}</TD>
                  <TD>{modeLabels[interview.mode] ?? interview.mode}</TD>
                  <TD>
                    <InterviewStatusBadge status={interview.status} />
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
