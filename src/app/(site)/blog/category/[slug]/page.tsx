import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Newspaper } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { BlogCard } from "@/features/blog/blog-card";
import { CategoryChips } from "@/features/blog/category-chips";
import { blogCategories, getBlogCategory, getPublishedPosts } from "@/features/blog/queries";

export function generateStaticParams() {
  return blogCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const category = getBlogCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} — Blog`,
    description: category.description,
    alternates: { canonical: `/blog/category/${category.slug}` },
  };
}

export default async function BlogCategoryPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const category = getBlogCategory(slug);
  if (!category) notFound();

  const posts = await getPublishedPosts({ category: category.slug });
  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    { label: category.name, href: `/blog/category/${category.slug}` },
  ];

  return (
    <>
      <section className="border-b border-line bg-background-alt">
        <div className="container-site py-10 md:py-14">
          <Breadcrumb items={breadcrumbItems} />
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Blog category</span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">{category.name}</h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-body">{category.description}</p>
          <div className="mt-7">
            <CategoryChips active={category.slug} />
          </div>
        </div>
      </section>

      <section className="container-site py-10 md:py-14" aria-label={`${category.name} articles`}>
        {posts.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center shadow-soft">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Newspaper className="size-6" aria-hidden />
            </span>
            <h2 className="mt-5 text-xl font-bold">Nothing in {category.name} yet</h2>
            <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-body">
              New articles land here first — check back soon, or browse everything we&apos;ve published so far.
            </p>
            <Link href="/blog" className="mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline">
              All articles
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        )}
      </section>

      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
    </>
  );
}
