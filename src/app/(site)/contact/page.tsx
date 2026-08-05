import type { Metadata } from "next";
import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Reveal } from "@/components/shared/reveal";
import { BrandIcon } from "@/components/shared/brand-icons";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getContactContent } from "@/features/site-content/queries";

export const metadata: Metadata = {
  title: "Contact Us — Talk to a Human",
  description: `Call or email us — ${siteConfig.responseSla} Offices at ${siteConfig.address.street}, ${siteConfig.address.city}. ${siteConfig.hours}.`,
  alternates: { canonical: "/contact" },
};

const crumbs = [{ label: "Contact", href: "/contact" }];

/** Social profiles aren't live yet — icons render as placeholders, not links. */
const socials = [
  { name: "linkedin" as const, label: "LinkedIn" },
  { name: "x" as const, label: "X (Twitter)" },
  { name: "instagram" as const, label: "Instagram" },
  { name: "facebook" as const, label: "Facebook" },
];

export default async function ContactPage() {
  const contact = await getContactContent();
  const fullAddress = `${contact.street}, ${contact.city}, ${contact.state} ${contact.postalCode}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${siteConfig.name}, ${fullAddress}`)}`;

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Header */}
      <section className="container-site pb-12 pt-4 md:pb-14" aria-labelledby="contact-heading">
        <Reveal className="max-w-2xl">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Contact</span>
          <h1 id="contact-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            Talk to a human, <span className="text-gradient">not a ticket queue</span>
          </h1>
          <p className="mt-5 text-[16.5px] leading-relaxed text-body md:text-lg">
            Hiring, job hunting, or something in between — call or email us and a real person replies.{" "}
            {contact.responseSla}
          </p>
        </Reveal>
      </section>

      {/* Contact details + office */}
      <section className="bg-background-alt py-16 md:py-24" aria-label="Contact details">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="h-full rounded-card border border-line bg-surface p-7 shadow-soft md:p-8">
              <h2 className="text-lg font-bold">Reach us directly</h2>
              <ul className="mt-5 space-y-4">
                <li>
                  <a href={contact.phoneHref} className="group flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                      <Phone className="size-4.5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[14.5px] font-bold text-foreground group-hover:text-primary">
                        {contact.phone}
                      </span>
                      <span className="block text-[12.5px] text-faint">Mon–Sat, human on the line</span>
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                    <MessageCircle className="size-4.5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[14.5px] font-bold text-foreground">WhatsApp — {contact.whatsapp}</span>
                    <span className="block text-[12.5px] text-faint">Fastest for quick questions</span>
                  </span>
                </li>
                <li>
                  <a href={`mailto:${contact.email}`} className="group flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary-soft text-secondary">
                      <Mail className="size-4.5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[14.5px] font-bold text-foreground group-hover:text-primary">
                        {contact.email}
                      </span>
                      <span className="block text-[12.5px] text-faint">For briefs, resumes and everything else</span>
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-warning/12 text-warning">
                    <Clock className="size-4.5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[14.5px] font-bold text-foreground">Business hours</span>
                    <span className="block text-[12.5px] text-faint">{contact.hours}</span>
                  </span>
                </li>
              </ul>

              <div className="mt-6 flex items-center gap-2 border-t border-line pt-5">
                <span className="text-[13px] font-semibold text-body">Follow us — profiles coming soon</span>
                <div className="ml-auto flex gap-2">
                  {socials.map((s) => (
                    <span
                      key={s.name}
                      title={`${s.label} — coming soon`}
                      className="grid size-9 place-items-center rounded-lg border border-line text-faint"
                    >
                      <BrandIcon name={s.name} className="size-4" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-card border border-dashed border-line bg-surface p-8 text-center shadow-soft">
              <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
                <MapPin className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-[15px] font-bold text-foreground">{siteConfig.name} — {contact.city} HQ</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">{fullAddress}</p>
              </div>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-primary hover:underline"
              >
                Open in Google Maps
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
