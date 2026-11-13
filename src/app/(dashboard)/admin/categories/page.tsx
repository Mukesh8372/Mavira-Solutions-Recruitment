import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { CategoriesManager } from "@/features/jobs/categories-manager";
import { getAdminCategories } from "@/features/admin/queries";

export const metadata: Metadata = { title: "Role categories", robots: { index: false } };

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <>
      <PageHeader
        title="Role categories"
        description="Every job has one role category. Each category has a public page at /jobs/category/… and appears in the job filters."
      />
      <CategoriesManager categories={categories} />
    </>
  );
}
