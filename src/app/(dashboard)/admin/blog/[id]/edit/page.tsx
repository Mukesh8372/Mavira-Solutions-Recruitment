import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { BlogForm } from "@/features/admin/blog-form";
import { getAdminBlogPost } from "@/features/admin/queries";
import { jsonArray } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit blog post — Admin", robots: { index: false } };

export default async function AdminEditBlogPostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const post = await getAdminBlogPost(id);
  if (!post) notFound();

  return (
    <>
      <PageHeader title="Edit post" description={`Editing “${post.title}”.`} />
      <BlogForm
        postId={post.id}
        defaults={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category as "career-advice" | "hiring-insights" | "industry-news",
          tags: jsonArray(post.tags).join(", "),
          readMinutes: post.readMinutes,
          status: post.status,
        }}
      />
    </>
  );
}
