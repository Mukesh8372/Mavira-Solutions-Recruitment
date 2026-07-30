import Link from "next/link";
import { cn } from "@/lib/utils";
import { blogCategories } from "@/features/blog/queries";

/** Pill navigation between the blog index and its category pages. */
export function CategoryChips({ active }: { active?: string }) {
  const chipClass = (isActive: boolean) =>
    cn(
      "inline-flex items-center rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors",
      isActive
        ? "border-primary bg-primary text-white"
        : "border-line bg-surface text-body shadow-soft hover:border-primary hover:text-primary"
    );
  return (
    <nav aria-label="Blog categories">
      <ul className="flex flex-wrap gap-2.5">
        <li>
          <Link href="/blog" className={chipClass(!active)} aria-current={!active ? "page" : undefined}>
            All articles
          </Link>
        </li>
        {blogCategories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/blog/category/${c.slug}`}
              className={chipClass(active === c.slug)}
              aria-current={active === c.slug ? "page" : undefined}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
