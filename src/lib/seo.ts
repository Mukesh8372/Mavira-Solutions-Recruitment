import { siteConfig } from "@/config/site";
import { jsonArray } from "@/lib/utils";
import type { Job, Company, Department } from "@prisma/client";

const employmentTypeMap: Record<string, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
  INTERNSHIP: "INTERN",
};

export type OrgContact = {
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  social: Record<string, string>;
};

export function organizationJsonLd(contact?: OrgContact) {
  return {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    telephone: contact?.phone ?? siteConfig.phone,
    email: contact?.email ?? siteConfig.email,
    foundingDate: `${siteConfig.founded}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact?.street ?? siteConfig.address.street,
      addressLocality: contact?.city ?? siteConfig.address.city,
      addressRegion: contact?.state ?? siteConfig.address.state,
      postalCode: contact?.postalCode ?? siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    sameAs: Object.values(contact?.social ?? siteConfig.social),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteConfig.url}/jobs?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: "Home", href: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
    })),
  };
}

export function jobPostingJsonLd(job: Job & { company: Company; department: Department }) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: (job.publishedAt ?? job.createdAt).toISOString(),
    ...(job.validThrough ? { validThrough: job.validThrough.toISOString() } : {}),
    employmentType: employmentTypeMap[job.employmentType] ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
      ...(job.company.website ? { sameAs: job.company.website } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "IN" },
    },
    ...(job.workMode === "REMOTE" ? { jobLocationType: "TELECOMMUTE" } : {}),
    ...(job.salaryVisible && job.salaryMin && job.salaryMax
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: { "@type": "QuantitativeValue", minValue: job.salaryMin, maxValue: job.salaryMax, unitText: "YEAR" },
          },
        }
      : {}),
    experienceRequirements: {
      "@type": "OccupationalExperienceRequirements",
      monthsOfExperience: job.experienceMin * 12,
    },
    skills: jsonArray(job.skills).join(", "),
    industry: job.department.name,
    directApply: true,
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function articleJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string;
  coverImage?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${siteConfig.url}/blog/${post.slug}`,
    ...(post.publishedAt ? { datePublished: post.publishedAt.toISOString() } : {}),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.authorName },
    publisher: { "@type": "Organization", name: siteConfig.name, logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo.png` } },
    ...(post.coverImage ? { image: post.coverImage } : {}),
  };
}
