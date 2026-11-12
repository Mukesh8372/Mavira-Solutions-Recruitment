import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { ClientsManager } from "@/features/jobs/clients-manager";
import { getAdminClients } from "@/features/admin/queries";

export const metadata: Metadata = { title: "Clients — Admin", robots: { index: false } };

export default async function AdminClientsPage() {
  const clients = await getAdminClients();
  return (
    <>
      <PageHeader title="Clients" description="The companies you recruit for. Each job is attached to one client; mark a job confidential to hide the name." />
      <ClientsManager
        clients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          website: c.website,
          industry: c.industry,
          size: c.size,
          about: c.about,
          jobCount: c._count.jobs,
        }))}
      />
    </>
  );
}
