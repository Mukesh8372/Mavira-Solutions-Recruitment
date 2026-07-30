/**
 * Single source of truth for brand & contact details.
 * Rebrand the entire site by editing this file.
 */
export const siteConfig = {
  name: "TalentBridge",
  legalName: "TalentBridge Consulting Pvt. Ltd.",
  tagline: "The right people, faster.",
  description:
    "TalentBridge is a full-service recruitment and placement agency connecting employers with vetted talent across IT, BFSI, healthcare, manufacturing, retail and logistics. 12,000+ placements, 500+ client companies, 15+ years.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "+91 98765 00000",
  phoneHref: "tel:+919876500000",
  whatsappHref: "https://wa.me/919876500000",
  email: "hello@talentbridge.example",
  address: {
    street: "4th Floor, Horizon Tower, MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560001",
    country: "IN",
  },
  hours: "Mon–Sat, 9:30 AM – 6:30 PM IST",
  founded: 2011,
  social: {
    linkedin: "https://linkedin.com/company/talentbridge-example",
    twitter: "https://x.com/talentbridge_example",
    instagram: "https://instagram.com/talentbridge.example",
    facebook: "https://facebook.com/talentbridge.example",
  },
  responseSla: "We respond within 1 business day.",
} as const;

export type SiteConfig = typeof siteConfig;
