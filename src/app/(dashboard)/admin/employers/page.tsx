import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { getAdminEmployers } from "@/features/admin/queries";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Employers — Admin", robots: { index: false } };

export default async function AdminEmployersPage() {
  const companies = await getAdminEmployers();

  return (
    <>
      <PageHeader title="Employers" description="Client companies, their team members and live roles." />
      {companies.length === 0 ? (
        <EmptyState icon="building" title="No companies yet" body="Client companies will be listed here once created." />
      ) : (
        <TableShell>
          <Table className="min-w-[820px]">
            <THead>
              <TH>Company</TH>
              <TH>Industry</TH>
              <TH>Size</TH>
              <TH>Members</TH>
              <TH>Jobs</TH>
              <TH>Created</TH>
            </THead>
            <TBody>
              {companies.map((company) => (
                <TR key={company.id}>
                  <TD className="font-semibold text-foreground">{company.name}</TD>
                  <TD>{company.industry ?? "—"}</TD>
                  <TD>{company.size ?? "—"}</TD>
                  <TD className="max-w-64">
                    {company.members.length > 0 ? company.members.map((m) => m.user.name).join(", ") : "—"}
                  </TD>
                  <TD>{company._count.jobs}</TD>
                  <TD>{formatDate(company.createdAt, { day: "numeric", month: "short", year: "numeric" })}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableShell>
      )}
    </>
  );
}
