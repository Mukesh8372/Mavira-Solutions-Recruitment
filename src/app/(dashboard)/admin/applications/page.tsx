import type { Metadata } from "next";
import type { ApplicationStatus } from "@prisma/client";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { FilterTabs } from "@/features/admin/filter-tabs";
import { AdminApplicationStatusSelect } from "@/features/admin/application-status-select";
import { getAdminApplications } from "@/features/admin/queries";
import { formatDate, labelApplicationStatus } from "@/lib/format";

export const metadata: Metadata = { title: "Applications — Admin", robots: { index: false } };

const statuses: ApplicationStatus[] = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "PLACED",
  "REJECTED",
  "WITHDRAWN",
];

export default async function AdminApplicationsPage(props: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await props.searchParams;
  const active = statuses.find((s) => s.toLowerCase() === status?.toLowerCase());
  const applications = await getAdminApplications(active);

  return (
    <>
      <PageHeader title="Applications" description="Move candidates through the pipeline — every change notifies them." />
      <FilterTabs
        label="Filter applications by status"
        tabs={[
          { label: "All", href: "/admin/applications", active: !active },
          ...statuses.map((s) => ({
            label: labelApplicationStatus(s),
            href: `/admin/applications?status=${s.toLowerCase()}`,
            active: s === active,
          })),
        ]}
      />
      {applications.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={active ? `Nothing in ${labelApplicationStatus(active).toLowerCase()}` : "No applications yet"}
          body="Applications from the jobs board will show up here as they come in."
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
              <TH>Change status</TH>
            </THead>
            <TBody>
              {applications.map((app) => (
                <TR key={app.id}>
                  <TD className="font-semibold text-foreground">
                    {app.candidate.user.name}
                    <span className="block text-[12px] font-normal text-faint">{app.candidate.user.email}</span>
                  </TD>
                  <TD>
                    {app.job.title}
                    <span className="block text-[12px] text-faint">{app.job.company.name}</span>
                  </TD>
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
                        className="text-[13px] font-semibold text-primary hover:underline"
                      >
                        View resume
                      </a>
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD>
                    <AdminApplicationStatusSelect applicationId={app.id} status={app.status} />
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
