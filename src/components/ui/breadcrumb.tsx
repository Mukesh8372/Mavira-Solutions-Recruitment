import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-faint">
        <li>
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <Fragment key={`${item.label}-${i}`}>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current={i === items.length - 1 ? "page" : undefined}>
              {item.href && i !== items.length - 1 ? (
                <Link href={item.href} className="transition-colors hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span className="text-body">{item.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
