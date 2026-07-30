import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/shared/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.legalName} collects, uses, shares and protects personal data — including resumes and candidate profiles — and the rights you have over it.`,
  alternates: { canonical: "/privacy-policy" },
};

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          This policy is published by <strong>{siteConfig.legalName}</strong> (&ldquo;{siteConfig.name}&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;), a recruitment and staffing company registered in India with its
          principal office at {siteConfig.address.street}, {siteConfig.address.city}, {siteConfig.address.state}{" "}
          {siteConfig.address.postalCode}. It applies to this website, our candidate and employer portals, and the
          recruitment services we deliver offline.
        </p>
        <p>
          For any privacy question or request, write to <strong>{siteConfig.email}</strong> or call{" "}
          {siteConfig.phone} ({siteConfig.hours}).
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "Data we collect",
    body: (
      <>
        <p>We collect only what the recruitment process needs:</p>
        <ul className="space-y-2">
          <li>
            <strong>Candidate data</strong> — name, email, phone, city, and the contents of your resume: work history,
            education, skills, current and expected compensation, notice period, and any cover note you write. If you
            create an account, also your application history and saved jobs.
          </li>
          <li>
            <strong>Employer data</strong> — contact details of hiring stakeholders, company information, role briefs,
            compensation bands and interview feedback shared during an engagement.
          </li>
          <li>
            <strong>Enquiry data</strong> — messages sent through our contact, request-talent and newsletter forms.
          </li>
          <li>
            <strong>Technical data</strong> — IP address, device and browser information, and page interactions,
            collected for security (such as rate-limiting form abuse) and to improve the site.
          </li>
        </ul>
        <p>We do not knowingly collect data from anyone under 18, and we never ask candidates for payment details.</p>
      </>
    ),
  },
  {
    id: "purpose",
    title: "Why we use it",
    body: (
      <>
        <ul className="space-y-2">
          <li>Matching candidates to current and future roles, including screening interviews and assessments.</li>
          <li>Sharing shortlisted profiles with employers — only for roles you match (see the next section).</li>
          <li>Running application tracking, so both sides can see live status.</li>
          <li>Payroll and statutory compliance (PF, ESI, TDS) where we are the employer of record for contract staff.</li>
          <li>Responding to enquiries, sending the newsletter you subscribed to, and improving our services.</li>
          <li>Preventing fraud and abuse, and meeting legal obligations.</li>
        </ul>
        <p>We do not sell personal data. Ever.</p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Sharing with employers and others",
    body: (
      <>
        <p>
          Recruitment requires sharing — but on our terms. Your resume and screening notes are shared{" "}
          <strong>only with employers whose specific roles you match</strong>, either because you applied or because a
          recruiter matched you from the talent pool and, for confidential mandates, spoke to you first. Employers are
          contractually required to use candidate data only for their hiring decision.
        </p>
        <p>
          We also use vetted service providers for hosting, communications and assessments, bound by data-processing
          agreements. We disclose data to authorities only where the law requires it. If our business is restructured,
          data may transfer to the successor entity under this same policy.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <>
        <ul className="space-y-2">
          <li>
            <strong>Talent-pool resumes</strong> — up to 3 years from your last interaction, so we can match you to
            future roles; deleted earlier on request.
          </li>
          <li>
            <strong>Application records</strong> — for the duration of the process plus 2 years, to handle guarantee
            periods and repeat applications.
          </li>
          <li>
            <strong>Payroll and statutory records</strong> — as mandated by applicable Indian law (typically 7–8
            years).
          </li>
          <li>
            <strong>Enquiries and newsletter data</strong> — until resolved or until you unsubscribe.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Under India&apos;s Digital Personal Data Protection Act, 2023 you can ask us, at any time, to:
        </p>
        <ul className="space-y-2">
          <li>Show you the personal data we hold about you and how it&apos;s being used.</li>
          <li>Correct or update it — including replacing your resume with a newer version.</li>
          <li>Delete it, including withdrawing your resume from the talent pool.</li>
          <li>Withdraw consent for future processing, without affecting past lawful processing.</li>
        </ul>
        <p>
          Email <strong>{siteConfig.email}</strong> with the subject &ldquo;Privacy request&rdquo; and we&apos;ll
          respond within 15 days. If you&apos;re unsatisfied, you may escalate to the Data Protection Board of India.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <p>
        Data is encrypted in transit, access is role-restricted to the recruiters working your profile or account,
        uploads are scanned and size-limited, and public forms are rate-limited against abuse. No system is perfectly
        secure, but if a breach affects your data we will notify you and the authorities as the law requires.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <>
        <p>We keep cookies minimal:</p>
        <ul className="space-y-2">
          <li>
            <strong>Essential cookies</strong> — session and security cookies that keep you signed in and protect
            forms. These can&apos;t be switched off.
          </li>
          <li>
            <strong>Preference cookies</strong> — your theme choice (light/dark).
          </li>
        </ul>
        <p>
          We do not run third-party advertising cookies. You can clear or block cookies in your browser; signed-in
          features will stop working without the essential ones.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        When we change this policy materially, we&apos;ll update the date at the top and, for significant changes
        affecting candidates or clients, notify you by email. Continued use of our services after a change means you
        accept the updated policy.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Recruitment runs on personal data — resumes, salary expectations, career histories. This policy explains, in plain language, what we collect, why, who sees it and the control you keep over it."
      lastUpdated={new Date("2026-07-01")}
      crumb={{ label: "Privacy Policy", href: "/privacy-policy" }}
      sections={sections}
    />
  );
}
