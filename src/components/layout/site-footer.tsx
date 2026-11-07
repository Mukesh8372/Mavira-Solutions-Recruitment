import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { BrandIcon } from "@/components/shared/brand-icons";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import { footerNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { getContactContent } from "@/features/site-content/queries";
import { getIndustries } from "@/features/content/queries";

export async function SiteFooter() {
  const [contact, industries] = await Promise.all([getContactContent(), getIndustries()]);
  const columns = footerNav.map((col) =>
    col.source === "industries"
      ? { ...col, links: [...industries.map((i) => ({ label: i.name, href: `/industries/${i.slug}` })), ...col.links] }
      : col
  );
  // Social profiles aren't live yet — icons render as placeholders, not links.
  const socials = [
    { label: "LinkedIn", icon: "linkedin" as const },
    { label: "Twitter / X", icon: "x" as const },
    { label: "Instagram", icon: "instagram" as const },
    { label: "Facebook", icon: "facebook" as const },
  ];
  return (
    <footer className="border-t border-line bg-background-alt">
      <div className="container-site py-14 md:py-16">
        {/* Newsletter */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-line pb-12 lg:flex-row lg:items-center">
          <div className="max-w-md">
            <h2 className="text-xl font-bold">Hiring insights, monthly</h2>
            <p className="mt-1.5 text-[14.5px] text-body">
              Salary trends, hiring playbooks and career advice from our placement desk. One email a month.
            </p>
          </div>
          <NewsletterForm />
        </div>

        {/* Link columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-[14px] leading-relaxed text-body">{siteConfig.tagline} Specialist recruitment partners to India&apos;s BFSI, broking and FinTech companies.</p>
            <ul className="mt-5 space-y-2.5 text-[13.5px] text-body">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden />
                <span>
                  {contact.street}, {contact.city} {contact.postalCode}
                </span>
              </li>
              <li>
                <a href={contact.phoneHref} className="flex items-center gap-2 transition-colors hover:text-primary">
                  <Phone className="size-4 shrink-0 text-faint" aria-hidden />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 transition-colors hover:text-primary">
                  <Mail className="size-4 shrink-0 text-faint" aria-hidden />
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-faint">{col.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-[14px] text-body transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-8 text-[13px] text-faint">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-accent" aria-hidden />
            Officially registered &amp; legally compliant
          </span>
          <span>CIN: {siteConfig.cin}</span>
          <span>GSTIN: {siteConfig.gstin}</span>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 sm:flex-row sm:items-center">
          <p className="text-[13px] text-faint">
            © {new Date().getFullYear()} {siteConfig.legalName} All rights reserved. ·{" "}
            <Link href="/privacy-policy" className="transition-colors hover:text-primary">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="transition-colors hover:text-primary">
              Terms
            </Link>
          </p>
          <ul className="flex items-center gap-2">
            {socials.map(({ label, icon }) => (
              <li key={label}>
                <span
                  title={`${label} — coming soon`}
                  className="grid size-9 place-items-center rounded-lg border border-line text-faint"
                >
                  <BrandIcon name={icon} className="size-4" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
