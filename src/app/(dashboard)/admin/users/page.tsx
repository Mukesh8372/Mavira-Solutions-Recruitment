import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { UserRoleSelect } from "@/features/admin/user-role-select";
import { getAdminUsers } from "@/features/admin/queries";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Users & roles — Admin", robots: { index: false } };

const roleBadge: Record<string, { label: string; variant: "red" | "purple" | "amber" | "neutral" }> = {
  ADMIN: { label: "Admin", variant: "red" },
  STAFF: { label: "Staff", variant: "purple" },
  EMPLOYER: { label: "Employer", variant: "amber" },
  CANDIDATE: { label: "Candidate", variant: "neutral" },
};

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([auth(), getAdminUsers()]);
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <>
      <PageHeader
        title="Users & roles"
        description={
          isAdmin
            ? "Grant or revoke access. Employer accounts need a company attached."
            : "Read-only for staff — only admins can change roles."
        }
      />
      {users.length === 0 ? (
        <EmptyState icon="shield" title="No users found" body="Registered users will be listed here." />
      ) : (
        <TableShell>
          <Table className="min-w-[760px]">
            <THead>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Joined</TH>
              <TH>Change role</TH>
            </THead>
            <TBody>
              {users.map((user) => {
                const badge = roleBadge[user.role] ?? roleBadge.CANDIDATE;
                return (
                  <TR key={user.id}>
                    <TD className="font-semibold text-foreground">
                      {user.name}
                      {user.id === session?.user.id && <span className="ml-1.5 text-[12px] font-normal text-faint">(you)</span>}
                    </TD>
                    <TD>{user.email}</TD>
                    <TD>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TD>
                    <TD>{formatDate(user.createdAt, { day: "numeric", month: "short", year: "numeric" })}</TD>
                    <TD>
                      <UserRoleSelect
                        userId={user.id}
                        role={user.role}
                        canEdit={isAdmin}
                        isSelf={user.id === session?.user.id}
                      />
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
