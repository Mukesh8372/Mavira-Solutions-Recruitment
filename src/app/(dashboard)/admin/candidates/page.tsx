import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { getAdminCandidates } from "@/features/admin/queries";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Candidates — Admin", robots: { index: false } };

export default async function AdminCandidatesPage() {
  const candidates = await getAdminCandidates();

  return (
    <>
      <PageHeader title="Candidates" description="Everyone in the talent pool — profiles, resumes and activity." />
      {candidates.length === 0 ? (
        <EmptyState icon="users" title="No candidates yet" body="Candidates who register or apply will appear here." />
      ) : (
        <TableShell>
          <Table className="min-w-[1000px]">
            <THead>
              <TH>Name</TH>
              <TH>Contact</TH>
              <TH>Headline</TH>
              <TH>Experience</TH>
              <TH>Location</TH>
              <TH>Applications</TH>
              <TH>Resumes</TH>
              <TH>Joined</TH>
            </THead>
            <TBody>
              {candidates.map((candidate) => (
                <TR key={candidate.id}>
                  <TD className="font-semibold text-foreground">{candidate.user.name}</TD>
                  <TD>
                    {candidate.user.email}
                    {candidate.user.phone && <span className="block text-[12px] text-faint">{candidate.user.phone}</span>}
                  </TD>
                  <TD className="max-w-56 truncate">{candidate.headline ?? "—"}</TD>
                  <TD>{candidate.experienceYears !== null ? `${candidate.experienceYears} yrs` : "—"}</TD>
                  <TD>{candidate.location ?? "—"}</TD>
                  <TD>{candidate._count.applications}</TD>
                  <TD>{candidate._count.resumes}</TD>
                  <TD>{formatDate(candidate.user.createdAt, { day: "numeric", month: "short", year: "numeric" })}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableShell>
      )}
    </>
  );
}
