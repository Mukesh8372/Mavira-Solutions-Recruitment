import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Newspaper } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { BlogCard } from "@/features/blog/blog-card";
import { CategoryChips } from "@/features/blog/category-chips";
import { getBlogCategory, getPublishedPosts } from "@/features/blog/queries";

export const metadata: Metadata = {
  title: "Blog — Career Advice, Hiring Insights & Industry News",
  description:
    "Practical career advice for candidates and hiring playbooks for employers — written by the TalentBridge placement desk, not a content farm.",
  alternates: { canonical: "/blog" },
};

function categoryBadgeVariant(category: string) {
  return category === "career-advice" ? "green" : category === "hiring-insights" ? "purple" : "blue";
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();
  const [featured, ...rest] = posts;
  const breadcrumbItems = [{ label: "Blog", href: "/blog" }];

  return (
    <>
      <section className="border-b border-line bg-background-alt">
        <div className="container-site py-10 md:py-14">
          <Breadcrumb items={breadcrumbItems} />
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Insights</span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">From the placement desk</h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-body">
            Career advice for candidates, hiring playbooks for employers — field notes from a team that has closed 12,000+
            placements.
          </p>
          <div className="mt-7">
            <CategoryChips />
          </div>
        </div>
      </section>

      <section className="container-site py-10 md:py-14" aria-label="Articles">
        {featured ? (
          <>
            {/* Featured latest post */}
            <article className="group relative grid overflow-hidden rounded-card border border-line bg-surface shadow-card transition-all duration-250 hover:-translate-y-1 hover:shadow-lift md:grid-cols-2">
              <div className="relative hidden min-h-72 overflow-hidden bg-brand-gradient md:block" aria-hidden>
                <Newspaper className="absolute -bottom-8 -right-8 size-56 text-white/15" />
                <div className="absolute left-8 top-8">
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-white">
                    Latest article
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-7 md:p-10">
                <div className="flex items-center gap-2">
                  <Badge variant={categoryBadgeVariant(featured.category)}>
                    {getBlogCategory(featured.category)?.name ?? featured.category}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[12.5px] text-faint">
                    <Clock className="size-3" aria-hidden />
                    {featured.readMinutes} min read
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-bold leading-snug md:text-[28px]">
                  <Link href={`/blog/${featured.slug}`} className="transition-colors after:absolute after:inset-0 group-hover:text-primary">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-body">{featured.excerpt}</p>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={featured.author.name} src={featured.author.image} className="size-9" />
                    <div>
                      <p className="text-[13.5px] font-semibold text-foreground">{featured.author.name}</p>
                      {featured.publishedAt && (
                        <p className="text-[12.5px] text-faint">
                          {formatDate(featured.publishedAt, { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                    Read article
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </div>
            </article>

            {rest.length > 0 && (
              <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <li key={post.id}>
                    <BlogCard post={post} />
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center shadow-soft">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Newspaper className="size-6" aria-hidden />
            </span>
            <h2 className="mt-5 text-xl font-bold">Articles are on the way</h2>
            <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-body">
              The placement desk is writing its first field notes. Meanwhile, the job board is very much open.
            </p>
            <Link href="/jobs" className="mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline">
              Browse current openings
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        )}
      </section>

      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
    </>
  );
}
