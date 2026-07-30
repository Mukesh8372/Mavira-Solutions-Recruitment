import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { BlogForm } from "@/features/admin/blog-form";

export const metadata: Metadata = { title: "New blog post — Admin", robots: { index: false } };

export default function AdminNewBlogPostPage() {
  return (
    <>
      <PageHeader title="New post" description="Write in Markdown. Save as draft or publish straight away." />
      <BlogForm />
    </>
  );
}
