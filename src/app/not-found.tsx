import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Search } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

const popularLinks = [
  { label: "Browse all jobs", href: "/jobs" },
  { label: "For employers", href: "/employers" },
  { label: "For candidates", href: "/candidates" },
  { label: "Contact us", href: "/contact" },
];

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <section className="container-site flex flex-col items-center py-24 text-center md:py-32">
          <p className="text-[88px] font-extrabold leading-none tracking-tight text-gradient md:text-[120px]" aria-hidden>
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            This page moved on to a better opportunity.
          </h1>
          <p className="mt-3 max-w-md text-[15.5px] text-body">
            The link may be outdated, or the role may have closed. Let&apos;s get you somewhere useful.
          </p>

          <form action="/jobs" method="get" className="mt-8 flex w-full max-w-md gap-2" role="search">
            <label htmlFor="nf-search" className="sr-only">
              Search jobs
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
              <input
                id="nf-search"
                name="q"
                type="search"
                placeholder="Search roles, e.g. React developer"
                className="h-12 w-full rounded-btn border border-line bg-surface pl-10 pr-3.5 text-[15px] text-foreground placeholder:text-faint focus-visible:border-primary"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center gap-1.5 rounded-btn bg-primary px-6 text-[15px] font-semibold text-white transition-colors hover:bg-primary-strong"
            >
              Search
            </button>
          </form>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {popularLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-4 py-2 text-[13.5px] font-semibold text-body transition-colors hover:border-primary hover:text-primary"
                >
                  {link.label}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
