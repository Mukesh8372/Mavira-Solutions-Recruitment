import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { FilterTabs } from "@/features/admin/filter-tabs";
import { QueryHandledButton } from "@/features/admin/query-handled-button";
import { getAdminContactQueries } from "@/features/admin/queries";
import { formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Contact queries — Admin", robots: { index: false } };

const audienceBadge: Record<string, { label: string; variant: "blue" | "purple" | "neutral" }> = {
  EMPLOYER: { label: "Employer", variant: "purple" },
  CANDIDATE: { label: "Candidate", variant: "blue" },
  OTHER: { label: "Other", variant: "neutral" },
};

export default async function AdminQueriesPage(props: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await props.searchParams;
  const handled = filter === "handled" ? true : filter === "open" ? false : undefined;
  const queries = await getAdminContactQueries(handled);

  return (
    <>
      <PageHeader title="Contact queries" description="Messages from the contact form — reply, then mark them handled." />
      <FilterTabs
        label="Filter queries"
        tabs={[
          { label: "All", href: "/admin/queries", active: handled === undefined },
          { label: "Open", href: "/admin/queries?filter=open", active: handled === false },
          { label: "Handled", href: "/admin/queries?filter=handled", active: handled === true },
        ]}
      />
      {queries.length === 0 ? (
        <EmptyState
          icon="mail"
          title={handled === false ? "Inbox clear" : "No queries here"}
          body="Messages sent through the contact page will show up in this list."
        />
      ) : (
        <TableShell>
          <Table className="min-w-[880px]">
            <THead>
              <TH>From</TH>
              <TH>Audience</TH>
              <TH>Message</TH>
              <TH>Received</TH>
              <TH className="text-right">Action</TH>
            </THead>
            <TBody>
              {queries.map((query) => {
                const badge = audienceBadge[query.audience] ?? audienceBadge.OTHER;
                return (
                  <TR key={query.id} className={query.handled ? "opacity-70" : undefined}>
                    <TD className="font-semibold text-foreground">
                      {query.name}
                      <span className="block text-[12px] font-normal text-faint">{query.email}</span>
                    </TD>
                    <TD>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TD>
                    <TD className="max-w-md">
                      <span className="line-clamp-2">{query.message}</span>
                    </TD>
                    <TD>{formatRelativeDate(query.createdAt)}</TD>
                    <TD className="text-right">
                      <QueryHandledButton queryId={query.id} handled={query.handled} />
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
