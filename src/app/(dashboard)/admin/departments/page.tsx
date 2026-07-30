import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { DepartmentsManager } from "@/features/site-content/departments-manager";

export const metadata: Metadata = { title: "Job categories", robots: { index: false } };

export default async function AdminDepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { jobs: true } } },
  });

  return (
    <>
      <PageHeader
        title="Job categories"
        description="Departments used for job filters and the /jobs/category landing pages."
      />
      <DepartmentsManager
        departments={departments.map((d) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          icon: d.icon,
          jobCount: d._count.jobs,
        }))}
      />
    </>
  );
}
