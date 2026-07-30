import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { IndustriesManager } from "@/features/site-content/industries-manager";

export const metadata: Metadata = { title: "Industries", robots: { index: false } };

export default async function AdminIndustriesPage() {
  const industries = await prisma.industry.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { jobs: true } } },
  });

  return (
    <>
      <PageHeader
        title="Industries"
        description="Each industry gets a public landing page and appears in the homepage strip and job filters."
      />
      <IndustriesManager
        industries={industries.map((i) => ({
          id: i.id,
          name: i.name,
          slug: i.slug,
          icon: i.icon,
          description: i.description,
          jobCount: i._count.jobs,
        }))}
      />
    </>
  );
}
