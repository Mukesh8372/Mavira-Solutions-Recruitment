import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { getBlogCategory } from "@/features/blog/queries";
import type { BlogPost } from "@prisma/client";

type PostWithAuthor = BlogPost & { author: { name: string; image: string | null } };

export function BlogCard({ post }: { post: PostWithAuthor }) {
  const category = getBlogCategory(post.category);
  return (
    <article className="group relative flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft transition-all duration-250 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-center gap-2">
        <Badge variant={post.category === "career-advice" ? "green" : post.category === "hiring-insights" ? "purple" : "blue"}>
          {category?.name ?? post.category}
        </Badge>
        <span className="inline-flex items-center gap-1 text-[12.5px] text-faint">
          <Clock className="size-3" aria-hidden />
          {post.readMinutes} min read
        </span>
      </div>
      <h3 className="mt-4 text-[17px] font-bold leading-snug">
        <Link href={`/blog/${post.slug}`} className="transition-colors after:absolute after:inset-0 group-hover:text-primary">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-body">{post.excerpt}</p>
      <p className="mt-4 border-t border-line pt-4 text-[12.5px] text-faint">
        {post.author.name}
        {post.publishedAt ? ` · ${formatDate(post.publishedAt, { day: "numeric", month: "short", year: "numeric" })}` : ""}
      </p>
    </article>
  );
}
