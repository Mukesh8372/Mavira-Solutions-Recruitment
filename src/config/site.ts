/**
 * Single source of truth for brand & contact details.
 * Rebrand the entire site by editing this file.
 */
export const siteConfig = {
  name: "Mavira Solutions",
  legalName: "Mavira Solutions Private Limited",
  tagline: "Connecting the right talent with the right opportunity.",
  description:
    "Mavira Solutions Private Limited is a premier recruitment company specializing in sourcing high-caliber professionals for the BFSI and Broking industries — banking, financial services, insurance, stock broking, wealth management, NBFC and FinTech.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "+91 79770 25412",
  phoneHref: "tel:+917977025412",
  whatsappHref: "https://wa.me/917977025412",
  email: "info@mavirasolutions.com",
  address: {
    street: "Office No. 506, Sai Baba Vihar Complex, Near Muchulla College, Ghodbunder Road",
    city: "Thane (West)",
    state: "Maharashtra",
    postalCode: "400615",
    country: "IN",
  },
  gstin: "27AAUCM9610M1ZN",
  cin: "U78300MR2026PTC476759",
  hours: "Mon–Sat, 9:30 AM – 6:30 PM IST",
  founded: 2026,
  social: {
    linkedin: "https://linkedin.com/company/mavira-solutions",
    twitter: "https://x.com/mavirasolutions",
    instagram: "https://instagram.com/mavirasolutions",
    facebook: "https://facebook.com/mavirasolutions",
  },
  responseSla: "We respond within 1 business day.",
} as const;

export type SiteConfig = typeof siteConfig;
