import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { ChangePasswordForm } from "@/features/auth/change-password-form";
import { getAuditLogs } from "@/features/admin/queries";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Settings — Admin", robots: { index: false } };

export default async function AdminSettingsPage() {
  const [session, logs] = await Promise.all([auth(), getAuditLogs()]);
  const roleLabel = session?.user.role === "ADMIN" ? "Admin" : "Staff";

  return (
    <>
      <PageHeader title="Settings" description="Your account, security and the audit trail." />
      <div className="space-y-6">
        <section aria-labelledby="account-heading" className="rounded-card border border-line bg-surface p-6 shadow-soft">
          <h2 id="account-heading" className="mb-3 text-[16px] font-bold">
            Account
          </h2>
          <dl className="space-y-2 text-[14px]">
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 text-faint">Name</dt>
              <dd className="font-semibold text-foreground">{session!.user.name}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 text-faint">Email</dt>
              <dd className="font-semibold text-foreground">{session!.user.email}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 text-faint">Role</dt>
              <dd className="font-semibold text-foreground">{roleLabel}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="security-heading" className="rounded-card border border-line bg-surface p-6 shadow-soft">
          <h2 id="security-heading" className="mb-4 text-[16px] font-bold">
            Change password
          </h2>
          <ChangePasswordForm />
        </section>

        <section aria-labelledby="audit-heading">
          <div className="mb-3">
            <h2 id="audit-heading" className="text-[16px] font-bold">
              Audit log
            </h2>
            <p className="text-[13px] text-body">The last 100 admin actions — every mutation is recorded.</p>
          </div>
          {logs.length === 0 ? (
            <p className="rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center text-[13.5px] text-body">
              No admin actions recorded yet. Changes made from this dashboard will show up here.
            </p>
          ) : (
            <TableShell>
              <Table>
                <THead>
                  <TH>Actor</TH>
                  <TH>Action</TH>
                  <TH>Entity</TH>
                  <TH>When</TH>
                </THead>
                <TBody>
                  {logs.map((log) => (
                    <TR key={log.id}>
                      <TD className="font-semibold text-foreground">{log.actor.name}</TD>
                      <TD>
                        <code className="rounded bg-background-alt px-1.5 py-0.5 text-[12.5px]">{log.action}</code>
                      </TD>
                      <TD>
                        {log.entity}
                        <span className="block text-[11.5px] text-faint">{log.entityId}</span>
                      </TD>
                      <TD>{formatDateTime(log.createdAt)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableShell>
          )}
        </section>
      </div>
    </>
  );
}
