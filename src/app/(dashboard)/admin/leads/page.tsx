import type { Metadata } from "next";
import type { LeadStatus } from "@prisma/client";
import { PageHeader } from "@/components/dashboard/page-header";
import { LeadStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { FilterTabs } from "@/features/admin/filter-tabs";
import { LeadStatusSelect } from "@/features/admin/lead-status-select";
import { getAdminLeads } from "@/features/admin/queries";
import { formatRelativeDate, labelLeadStatus } from "@/lib/format";

export const metadata: Metadata = { title: "Leads — Admin", robots: { index: false } };

const statuses: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

export default async function AdminLeadsPage(props: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await props.searchParams;
  const active = statuses.find((s) => s.toLowerCase() === status?.toLowerCase());
  const leads = await getAdminLeads(active);

  return (
    <>
      <PageHeader title="Leads" description="Request-talent submissions and hiring enquiries — work them to converted." />
      <FilterTabs
        label="Filter leads by status"
        tabs={[
          { label: "All", href: "/admin/leads", active: !active },
          ...statuses.map((s) => ({
            label: labelLeadStatus(s),
            href: `/admin/leads?status=${s.toLowerCase()}`,
            active: s === active,
          })),
        ]}
      />
      {leads.length === 0 ? (
        <EmptyState
          icon="target"
          title={active ? `No ${labelLeadStatus(active).toLowerCase()} leads` : "No leads yet"}
          body="Submissions from the request-talent form will land here."
        />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {leads.map((lead) => (
            <li key={lead.id} className="flex flex-col rounded-card border border-line bg-surface p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-bold text-foreground">{lead.companyName ?? lead.name}</p>
                  <p className="mt-0.5 text-[13px] text-body">
                    {lead.name} · <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a> · {lead.phone}
                  </p>
                </div>
                <Badge variant={lead.kind === "REQUEST_TALENT" ? "purple" : "neutral"}>
                  {lead.kind === "REQUEST_TALENT" ? "Request talent" : "General"}
                </Badge>
              </div>

              <dl className="mt-3 space-y-1 text-[13px]">
                {lead.hiringType && (
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-faint">Hiring type</dt>
                    <dd className="text-body">{lead.hiringType}</dd>
                  </div>
                )}
                {lead.rolesNeeded && (
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-faint">Roles</dt>
                    <dd className="text-body">{lead.rolesNeeded}</dd>
                  </div>
                )}
              </dl>
              {lead.message && <p className="mt-2 line-clamp-2 text-[13px] text-body">{lead.message}</p>}

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5 [&:not(:first-child)]:mt-4">
                <div className="flex items-center gap-2.5">
                  <LeadStatusBadge status={lead.status} />
                  <span className="text-[12px] text-faint">{formatRelativeDate(lead.createdAt)}</span>
                </div>
                <LeadStatusSelect leadId={lead.id} status={lead.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
