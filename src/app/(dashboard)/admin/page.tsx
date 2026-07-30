import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ApplicationStatusBadge, LeadStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { DashboardIcon } from "@/components/shared/dashboard-icon";
import { getAdminOverview } from "@/features/admin/queries";
import { formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin overview", robots: { index: false } };

const quickLinks = [
  { label: "Review jobs", href: "/admin/jobs", icon: "briefcase" },
  { label: "Work the leads", href: "/admin/leads", icon: "target" },
  { label: "Answer queries", href: "/admin/queries", icon: "mail" },
  { label: "Write a post", href: "/admin/blog/new", icon: "newspaper" },
];

export default async function AdminOverviewPage() {
  const data = await getAdminOverview();

  return (
    <>
      <PageHeader title="Admin overview" description="Placement desk at a glance — jobs, pipeline and inbound." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jobs live" value={data.publishedJobs} icon="briefcase" tone="primary" hint={`${data.draftJobs} in draft`} />
        <StatCard label="Applications" value={data.applicationsTotal} icon="inbox" tone="secondary" />
        <StatCard label="Applications this week" value={data.applicationsThisWeek} icon="file-text" tone="accent" />
        <StatCard label="Candidates" value={data.candidates} icon="users" tone="warning" />
        <StatCard label="Companies" value={data.companies} icon="building" tone="primary" />
        <StatCard label="New leads" value={data.newLeads} icon="target" tone="secondary" hint={data.newLeads > 0 ? "Waiting for first contact" : "All followed up"} />
        <StatCard label="Unhandled queries" value={data.unhandledQueries} icon="mail" tone="accent" hint={data.unhandledQueries > 0 ? "Needs a reply" : "Inbox clear"} />
        <StatCard label="Newsletter subscribers" value={data.subscribers} icon="send" tone="warning" />
      </div>

      <nav aria-label="Quick links" className="mt-6 flex flex-wrap gap-2.5">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex h-10 items-center gap-2 rounded-btn border border-line bg-surface px-4 text-[13.5px] font-semibold text-body shadow-soft transition-colors hover:border-faint hover:text-foreground"
          >
            <DashboardIcon name={link.icon} className="size-4 text-primary" />
            {link.label}
            <ArrowRight className="size-3.5 text-faint" aria-hidden />
          </Link>
        ))}
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="recent-apps-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-apps-heading" className="text-[16px] font-bold">
              Recent applications
            </h2>
            <Link href="/admin/applications" className="text-[13px] font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {data.recentApplications.length === 0 ? (
            <EmptyState icon="inbox" title="No applications yet" body="New applications from the jobs board will appear here." />
          ) : (
            <TableShell>
              <Table>
                <THead>
                  <TH>Candidate</TH>
                  <TH>Role</TH>
                  <TH>Status</TH>
                  <TH>Applied</TH>
                </THead>
                <TBody>
                  {data.recentApplications.map((app) => (
                    <TR key={app.id}>
                      <TD className="font-semibold text-foreground">{app.candidate.user.name}</TD>
                      <TD>
                        {app.job.title}
                        <span className="block text-[12px] text-faint">{app.job.company.name}</span>
                      </TD>
                      <TD>
                        <ApplicationStatusBadge status={app.status} />
                      </TD>
                      <TD>{formatRelativeDate(app.createdAt)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableShell>
          )}
        </section>

        <section aria-labelledby="new-leads-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="new-leads-heading" className="text-[16px] font-bold">
              Latest leads
            </h2>
            <Link href="/admin/leads" className="text-[13px] font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <EmptyState icon="target" title="No leads yet" body="Request-talent and contact leads will land here." />
          ) : (
            <ul className="space-y-3">
              {data.recentLeads.map((lead) => (
                <li key={lead.id} className="rounded-card border border-line bg-surface p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-bold text-foreground">{lead.companyName ?? lead.name}</p>
                      <p className="text-[12.5px] text-faint">
                        {lead.name} · {lead.email}
                      </p>
                    </div>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                  {lead.rolesNeeded && <p className="mt-2 line-clamp-1 text-[13px] text-body">{lead.rolesNeeded}</p>}
                  <p className="mt-1.5 text-[12px] text-faint">{formatRelativeDate(lead.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
