import Link from "next/link";
import type { Metadata } from "next";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { DeleteBlogPostButton } from "@/features/admin/blog-actions";
import { getAdminBlogPosts } from "@/features/admin/queries";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Blog — Admin", robots: { index: false } };

const categoryLabels: Record<string, string> = {
  "career-advice": "Career advice",
  "hiring-insights": "Hiring insights",
  "industry-news": "Industry news",
};

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();

  return (
    <>
      <PageHeader
        title="Blog"
        description="Drafts and published posts — career advice, hiring insights, industry news."
        actions={
          <Link
            href="/admin/blog/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-strong"
          >
            <PlusCircle className="size-4" aria-hidden />
            New post
          </Link>
        }
      />
      {posts.length === 0 ? (
        <EmptyState
          icon="newspaper"
          title="No posts yet"
          body="Write your first post — it starts as a draft until you publish it."
          cta={{ label: "New post", href: "/admin/blog/new" }}
        />
      ) : (
        <TableShell>
          <Table className="min-w-[820px]">
            <THead>
              <TH>Title</TH>
              <TH>Category</TH>
              <TH>Author</TH>
              <TH>Status</TH>
              <TH>Published</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {posts.map((post) => (
                <TR key={post.id} className={post.status === "DRAFT" ? "bg-warning/[0.04]" : undefined}>
                  <TD className="font-semibold text-foreground">
                    {post.title}
                    <span className="block text-[12px] font-normal text-faint">/{post.slug}</span>
                  </TD>
                  <TD>{categoryLabels[post.category] ?? post.category}</TD>
                  <TD>{post.author.name}</TD>
                  <TD>
                    <Badge variant={post.status === "PUBLISHED" ? "green" : "amber"}>
                      {post.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                  </TD>
                  <TD>
                    {post.publishedAt
                      ? formatDate(post.publishedAt, { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </TD>
                  <TD className="text-right">
                    <span className="inline-flex items-center gap-3">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-[13px] font-semibold text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteBlogPostButton postId={post.id} />
                    </span>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableShell>
      )}
    </>
  );
}
