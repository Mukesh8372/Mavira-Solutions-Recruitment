import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/shared/json-ld";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { Markdown } from "@/features/blog/markdown";
import { ShareRow } from "@/features/blog/share-row";
import { BlogCard } from "@/features/blog/blog-card";
import { getBlogCategory, getPostBySlug, getRelatedPosts } from "@/features/blog/queries";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") return { title: "Article not found" };
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const related = await getRelatedPosts(post);
  const category = getBlogCategory(post.category);
  const url = `${siteConfig.url}/blog/${post.slug}`;
  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    ...(category ? [{ label: category.name, href: `/blog/category/${category.slug}` }] : []),
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <>
      <div className="container-site max-w-3xl py-10 md:py-14">
        <Breadcrumb items={breadcrumbItems} />

        <article>
          <header>
            <div className="flex items-center gap-2.5">
              <Badge variant={post.category === "career-advice" ? "green" : post.category === "hiring-insights" ? "purple" : "blue"}>
                {category?.name ?? post.category}
              </Badge>
              <span className="inline-flex items-center gap-1 text-[13px] text-faint">
                <Clock className="size-3.5" aria-hidden />
                {post.readMinutes} min read
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.02em] md:text-[40px] md:leading-[1.15]">
              {post.title}
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-body">{post.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
              <div className="flex items-center gap-3">
                <Avatar name={post.author.name} src={post.author.image} />
                <div>
                  <p className="text-[14px] font-bold text-foreground">{post.author.name}</p>
                  {post.publishedAt && (
                    <p className="text-[12.5px] text-faint">
                      <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
                    </p>
                  )}
                </div>
              </div>
              <ShareRow url={url} title={post.title} />
            </div>
          </header>

          <div className="mt-8">
            <Markdown content={post.content} />
          </div>

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-[13.5px] text-faint">Found this useful? Pass it along.</p>
            <ShareRow url={url} title={post.title} />
          </footer>
        </article>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-background-alt py-14 md:py-20" aria-labelledby="related-posts-heading">
          <div className="container-site">
            <h2 id="related-posts-heading" className="text-2xl font-bold tracking-tight">
              Keep reading
            </h2>
            <ul className="mt-7 grid gap-5 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <BlogCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <JsonLd
        data={articleJsonLd({
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          authorName: post.author.name,
          coverImage: post.coverImage,
        })}
      />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
    </>
  );
}
