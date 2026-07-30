import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/shared/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms governing ${siteConfig.name}'s website and recruitment services — employer engagement terms, our zero-fee promise to candidates, guarantees, liability and governing law.`,
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "These terms, and who they bind",
    body: (
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the {siteConfig.name} website and portals,
        operated by <strong>{siteConfig.legalName}</strong>, {siteConfig.address.street}, {siteConfig.address.city},{" "}
        {siteConfig.address.state} {siteConfig.address.postalCode}. By browsing the site, submitting a form, applying
        to a role or engaging our services, you accept them. Specific client engagements are additionally governed by
        a signed engagement letter; where the two conflict, the engagement letter prevails.
      </p>
    ),
  },
  {
    id: "services",
    title: "Our services",
    body: (
      <>
        <p>{siteConfig.name} provides recruitment and workforce services, including:</p>
        <ul className="space-y-2">
          <li>Permanent hiring on a success-fee model;</li>
          <li>Contract staffing, where deployed staff are on our payroll with statutory compliance handled by us;</li>
          <li>Executive search on a partial-retainer model;</li>
          <li>Bulk and campus hiring programs;</li>
          <li>Payroll outsourcing and HR consulting.</li>
        </ul>
        <p>
          Job listings on this site are published in good faith on behalf of clients. We verify roles before listing,
          but details (compensation, location, timelines) may change at the client&apos;s end; the offer letter you
          receive from an employer is the authoritative document.
        </p>
      </>
    ),
  },
  {
    id: "candidates",
    title: "For candidates: the zero-fee policy",
    body: (
      <>
        <p>
          <strong>We never charge candidates.</strong> No registration fee, no processing fee, no training or
          documentation charges, no deduction from your salary — at any stage, for any role. Our revenue comes
          entirely from employers.
        </p>
        <ul className="space-y-2">
          <li>
            Anyone demanding money in {siteConfig.name}&apos;s name is committing fraud. Do not pay; report it to{" "}
            <strong>{siteConfig.email}</strong> and we will pursue it.
          </li>
          <li>
            You are responsible for the accuracy of your resume and application details. Material misrepresentation
            (fake experience, forged documents) leads to removal from our database and may be disclosed to affected
            employers.
          </li>
          <li>
            By submitting a resume you authorise us to share it with employers for roles you match, as described in
            our Privacy Policy.
          </li>
          <li>Placement decisions rest with employers; we do not guarantee any candidate a job or interview.</li>
        </ul>
      </>
    ),
  },
  {
    id: "employers",
    title: "For employers: engagement terms",
    body: (
      <>
        <p>Standard commercial terms, confirmed per engagement in the engagement letter:</p>
        <ul className="space-y-2">
          <li>
            <strong>Success fees</strong> for permanent hiring are a percentage of the candidate&apos;s annual CTC,
            invoiced on joining, payable within 30 days.
          </li>
          <li>
            <strong>Replacement guarantee</strong>: if a permanent placement exits within the agreed guarantee period
            (typically 90 days), we replace the candidate at no additional fee. The guarantee lapses if invoices are
            unpaid or the exit results from role changes, relocation or retrenchment at your end.
          </li>
          <li>
            <strong>Candidate ownership</strong>: a candidate introduced by us and hired within 12 months of
            introduction — in any role or entity of your group — attracts the applicable fee.
          </li>
          <li>
            <strong>Confidentiality</strong>: candidate profiles are shared for your hiring decision only and may not
            be forwarded, retained beyond the process, or used to approach candidates outside the engagement.
          </li>
          <li>
            <strong>Contract staffing and payroll</strong> engagements are billed monthly per the rate card; statutory
            components are itemised on each invoice.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use of the site",
    body: (
      <ul className="space-y-2">
        <li>Don&apos;t submit false information or impersonate another person or company.</li>
        <li>Don&apos;t scrape, bulk-download or resell job listings or candidate data.</li>
        <li>Don&apos;t attempt to bypass security controls, rate limits or access others&apos; accounts.</li>
        <li>
          Content you submit (applications, messages, reviews) must be lawful and yours to share; you grant us the
          licence needed to process it for the purposes described.
        </li>
      </ul>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: (
      <p>
        The {siteConfig.name} name, logo, site design and content are the property of {siteConfig.legalName} or its
        licensors. You may not reproduce them beyond normal browsing and sharing of links without written permission.
        Resumes remain the property of the candidates who submit them.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    body: (
      <>
        <p>
          We deliver our services with professional skill and care, but recruitment outcomes depend on people and
          markets we don&apos;t control. To the maximum extent permitted by law:
        </p>
        <ul className="space-y-2">
          <li>
            The site and its content are provided &ldquo;as is&rdquo;; we don&apos;t warrant uninterrupted or
            error-free operation.
          </li>
          <li>
            We are not liable for hiring or joining decisions made by employers or candidates, or for indirect losses
            such as lost profits or lost opportunity.
          </li>
          <li>
            Our aggregate liability under any engagement is capped at the fees paid to us under that engagement in the
            preceding 12 months.
          </li>
        </ul>
        <p>Nothing in these Terms limits liability that cannot be limited under Indian law, including for fraud.</p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: (
      <p>
        We may suspend or terminate access for breach of these Terms — including candidate misrepresentation, employer
        misuse of profiles, or abuse of the platform. Client engagements terminate per their engagement letters;
        accrued fees survive termination. You may close a candidate account or withdraw your data at any time as
        described in the Privacy Policy.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law and disputes",
    body: (
      <p>
        These Terms are governed by the laws of India. Courts at {siteConfig.address.city}, {siteConfig.address.state}{" "}
        have exclusive jurisdiction, and any engagement-letter arbitration clause applies to those engagements. We
        first attempt to resolve every dispute directly — write to <strong>{siteConfig.email}</strong> and a senior
        team member will respond within one business day.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these Terms as our services and the law evolve. The date above reflects the latest revision;
        material changes are announced on the site or by email to account holders. Continued use after a change means
        you accept the updated Terms.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The short version: we never charge candidates, employers pay only for results, and both sides get treated the way we'd want to be treated. The long version, for the lawyers, follows."
      lastUpdated={new Date("2026-07-01")}
      crumb={{ label: "Terms of Service", href: "/terms" }}
      sections={sections}
    />
  );
}
