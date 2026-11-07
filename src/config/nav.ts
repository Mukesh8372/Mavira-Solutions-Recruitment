export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = { label: string; href?: string; links?: NavLink[]; featured?: NavLink };

export const services: NavLink[] = [
  { label: "Permanent Recruitment", href: "/services/permanent-recruitment", description: "Full-time hiring, mid to senior levels" },
  { label: "Executive Search", href: "/services/executive-search", description: "Confidential leadership hiring" },
  { label: "Bulk Hiring", href: "/services/bulk-hiring", description: "High-volume drives, structured screening" },
  { label: "BFSI Recruitment", href: "/services/bfsi-recruitment", description: "Banking, insurance, wealth & FinTech" },
  { label: "Broking Recruitment", href: "/services/broking-recruitment", description: "Dealers, RMs, branch heads & analysts" },
];

export const mainNav: NavGroup[] = [
  { label: "About", href: "/about" },
  { label: "Services", links: services, featured: { label: "Request Talent", href: "/employers#request-talent", description: "Tell us who you need — we respond within 1 business day" } },
  { label: "Industries", href: "/industries" },
  {
    label: "Company",
    links: [
      { label: "Why Choose Us", href: "/why-choose-us" },
      { label: "Our Process", href: "/process" },
      { label: "For Employers", href: "/employers" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

/**
 * `source: "industries"` marks a column whose links SiteFooter fills from the
 * Industry table (before the static links), so admin edits show up in the footer.
 */
export type FooterColumn = { heading: string; links: NavLink[]; source?: "industries" };

export const footerNav: FooterColumn[] = [
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Why Choose Us", href: "/why-choose-us" },
      { label: "Our Process", href: "/process" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Services",
    links: [
      ...services.map(({ label, href }) => ({ label, href })),
      { label: "Request Talent", href: "/employers#request-talent" },
    ],
  },
  {
    heading: "Industries",
    source: "industries",
    links: [{ label: "All Industries", href: "/industries" }],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];
