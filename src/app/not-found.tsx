import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

const popularLinks = [
  { label: "About us", href: "/about" },
  { label: "Our services", href: "/services" },
  { label: "For employers", href: "/employers" },
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
            The link may be outdated. Let&apos;s get you somewhere useful.
          </p>

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
