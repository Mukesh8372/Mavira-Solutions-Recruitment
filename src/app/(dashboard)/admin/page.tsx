import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { LeadStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { DashboardIcon } from "@/components/shared/dashboard-icon";
import { getAdminOverview } from "@/features/admin/queries";
import { formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin overview", robots: { index: false } };

const quickLinks = [
  { label: "Edit site content", href: "/admin/site-content", icon: "globe" },
  { label: "Work the leads", href: "/admin/leads", icon: "target" },
  { label: "Write a post", href: "/admin/blog/new", icon: "newspaper" },
];

export default async function AdminOverviewPage() {
  const data = await getAdminOverview();

  return (
    <>
      <PageHeader title="Admin overview" description="The website at a glance — inbound leads and site content." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New leads" value={data.newLeads} icon="target" tone="primary" hint={data.newLeads > 0 ? "Waiting for first contact" : "All followed up"} />
        <StatCard label="Published posts" value={data.publishedPosts} icon="newspaper" tone="secondary" hint={`${data.draftPosts} in draft`} />
        <StatCard label="Newsletter subscribers" value={data.subscribers} icon="send" tone="accent" />
        <StatCard label="Testimonials" value={data.testimonials} icon="quote" tone="warning" hint={`${data.pendingTestimonials} awaiting approval`} />
        <StatCard label="Success stories" value={data.successStories} icon="award" tone="primary" />
        <StatCard label="FAQs" value={data.faqs} icon="circle-help" tone="secondary" />
        <StatCard label="Industries" value={data.industries} icon="factory" tone="accent" />
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

      <section aria-labelledby="new-leads-heading" className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="new-leads-heading" className="text-[16px] font-bold">
            Latest leads
          </h2>
          <Link href="/admin/leads" className="text-[13px] font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {data.recentLeads.length === 0 ? (
          <EmptyState icon="target" title="No leads yet" body="Request-talent submissions from the website will land here." />
        ) : (
          <TableShell>
            <Table>
              <THead>
                <TH>Company</TH>
                <TH>Contact</TH>
                <TH>Hiring for</TH>
                <TH>Status</TH>
                <TH>Received</TH>
              </THead>
              <TBody>
                {data.recentLeads.map((lead) => (
                  <TR key={lead.id}>
                    <TD className="font-semibold text-foreground">{lead.companyName ?? "—"}</TD>
                    <TD>
                      {lead.name}
                      <span className="block text-[12px] text-faint">
                        {lead.email} · {lead.phone}
                      </span>
                    </TD>
                    <TD>{lead.hiringType ?? "—"}</TD>
                    <TD>
                      <LeadStatusBadge status={lead.status} />
                    </TD>
                    <TD>{formatRelativeDate(lead.createdAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableShell>
        )}
      </section>
    </>
  );
}
