import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { DeleteSubscriberButton } from "@/features/admin/newsletter-actions";
import { getAdminSubscribers } from "@/features/admin/queries";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Newsletter — Admin", robots: { index: false } };

export default async function AdminNewsletterPage() {
  const { subscribers, activeCount } = await getAdminSubscribers();

  return (
    <>
      <PageHeader
        title="Newsletter"
        description={`${activeCount} active subscriber${activeCount === 1 ? "" : "s"} on the list.`}
      />
      {subscribers.length === 0 ? (
        <EmptyState icon="send" title="No subscribers yet" body="Signups from the site footer will appear here." />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <TH>Email</TH>
              <TH>Subscribed</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {subscribers.map((sub) => (
                <TR key={sub.id}>
                  <TD className="font-semibold text-foreground">{sub.email}</TD>
                  <TD>{formatDate(sub.createdAt, { day: "numeric", month: "short", year: "numeric" })}</TD>
                  <TD>
                    <Badge variant={sub.unsubscribedAt ? "neutral" : "green"}>
                      {sub.unsubscribedAt ? "Unsubscribed" : "Active"}
                    </Badge>
                  </TD>
                  <TD className="text-right">
                    <DeleteSubscriberButton subscriberId={sub.id} />
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
