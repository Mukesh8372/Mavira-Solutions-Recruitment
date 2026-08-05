export type ServiceContent = {
  slug: string;
  title: string;
  icon: string;
  short: string;
  headline: string;
  intro: string;
  bullets: { title: string; body: string }[];
  bestFor: string[];
  faq: { question: string; answer: string }[];
};

export const servicesContent: ServiceContent[] = [
  {
    slug: "permanent-recruitment",
    title: "Permanent Recruitment",
    icon: "user-check",
    short: "End-to-end hiring for full-time roles across mid to senior levels.",
    headline: "Full-time hires with the right cultural and professional fit",
    intro:
      "We run the entire funnel — understanding your requirement, sourcing, screening, preliminary interviews and offer management — and send you thoroughly vetted candidates within optimal timelines. Every profile is matched for both capability and cultural fit before it reaches you.",
    bullets: [
      { title: "Deep requirement intake", body: "We start by gaining a genuine comprehension of the role, your team and your expectations — so search effort goes where it counts." },
      { title: "Rigorous screening", body: "Resume screening, pre-filtering and a preliminary interview before any profile reaches your desk. No resume-dumping." },
      { title: "Offer & negotiation support", body: "We manage salary negotiation and keep candidates engaged through joining, protecting your offer-to-join conversion." },
      { title: "Follow-up after joining", body: "Structured follow-up and relationship management after day one, so placements stick." },
    ],
    bestFor: ["Mid to senior full-time roles", "Replacement and growth hiring", "BFSI, broking and FinTech teams"],
    faq: [
      { question: "What does permanent recruitment cost?", answer: "We work on a success-fee model — a percentage of the candidate's annual CTC, payable on joining. The exact terms depend on role seniority and volume; contact us for a quote." },
      { question: "How fast will I see candidates?", answer: "Quality recruitment with unmatched quick turnaround time is our core strength. After the intake call we share an honest timeline for your specific role and market." },
    ],
  },
  {
    slug: "executive-search",
    title: "Executive Search",
    icon: "crown",
    short: "Strategic headhunting for C-suite, VP and leadership positions.",
    headline: "Leadership searches run with discretion and precision",
    intro:
      "Our executive practice runs confidential, research-led searches for C-suite, VP and leadership positions that demand discretion, precision and deep industry networks — especially across BFSI, broking and FinTech.",
    bullets: [
      { title: "Deep industry networks", body: "Years of relationships across banking, financial services, insurance, broking and FinTech leadership." },
      { title: "Absolute confidentiality", body: "Approaches under NDA, anonymised briefs and disclosure only at mutually agreed stages." },
      { title: "Precision matching", body: "Leadership hires are assessed on track record, domain depth and cultural alignment — not just the résumé." },
      { title: "End-to-end management", body: "From market mapping through offer negotiation and transition support." },
    ],
    bestFor: ["C-suite and VP hiring", "Confidential replacements", "Leadership build-outs in financial services"],
    faq: [
      { question: "How confidential is the process?", answer: "Completely. Approaches are made under NDA with anonymised briefs; your company is disclosed only at stages you approve." },
      { question: "Do you work on retained or contingency terms?", answer: "Executive searches are scoped individually — contact us to discuss the engagement model that fits your search." },
    ],
  },
  {
    slug: "bulk-hiring",
    title: "Bulk Hiring",
    icon: "users-round",
    short: "High-volume recruitment drives for rapid scaling, with structured screening.",
    headline: "Rapid scaling with structured screening and onboarding pipelines",
    intro:
      "When you need to scale a team quickly — a new branch, a growing sales force, an expanding operations desk — we run high-volume recruitment drives designed for rapid scaling, with structured screening and onboarding pipelines that protect quality at volume.",
    bullets: [
      { title: "Structured screening at scale", body: "Every candidate in a volume drive still goes through resume screening, pre-filtering and a preliminary interview." },
      { title: "Onboarding pipelines", body: "Joining support and onboarding coordination keep your ramp plan on track." },
      { title: "Quick turnaround", body: "A strong professional database and a focused team mean drives start producing joiners fast." },
      { title: "Follow-up & retention", body: "Post-joining follow-up and relationship management reduce early attrition." },
    ],
    bestFor: ["Branch and sales-team expansion", "Relationship manager cohorts", "Operations and support desks"],
    faq: [
      { question: "What roles do you bulk-hire?", answer: "Primarily BFSI and broking front-line and mid-level roles — relationship managers, equity dealers, sales and branch staff, operations executives and team leaders." },
      { question: "How do you protect quality at volume?", answer: "The same structured pipeline as our permanent hiring — screening, pre-filtering and preliminary interviews — applied with dedicated drive coordination." },
    ],
  },
  {
    slug: "bfsi-recruitment",
    title: "BFSI Recruitment",
    icon: "landmark",
    short: "Banking, insurance, wealth management, NBFC & FinTech specialists.",
    headline: "Specialist hiring for banking, insurance, wealth and FinTech",
    intro:
      "BFSI is our home turf. We source high-caliber professionals across banking & financial services, insurance & wealth management, and NBFC & FinTech — with recruiters who understand the products, the regulations and the targets these roles carry.",
    bullets: [
      { title: "Domain-native screening", body: "Recruiters who know the difference between a CASA-focused RM and a wealth RM — and screen accordingly." },
      { title: "Key roles covered", body: "Relationship Managers, Wealth Managers, Sales & Branch Managers, Operations Executives, Compliance Officers and Team Leaders." },
      { title: "Regulatory awareness", body: "Profiles checked for certifications and compliance history relevant to the role." },
      { title: "Pan-India reach", body: "Metro and tier-2 coverage for branch network expansion." },
    ],
    bestFor: ["Banks and NBFCs", "Insurance and wealth management firms", "FinTech companies"],
    faq: [
      { question: "Which BFSI roles do you place most?", answer: "Relationship Managers, Wealth Managers, Sales & Branch Managers, Operations Executives, Compliance Officers and Team Leaders — from front-line to leadership." },
      { question: "Do you verify certifications?", answer: "Yes — relevant certifications (IRDAI, AMFI, NISM and similar) are verified during screening where the role requires them." },
    ],
  },
  {
    slug: "broking-recruitment",
    title: "Broking Recruitment",
    icon: "briefcase-business",
    short: "Equity dealers, relationship managers, branch managers & research analysts.",
    headline: "Hiring for the broking industry, by people who know it",
    intro:
      "Stock broking and equity firms hire against licenses, targets and market cycles. We place Equity Dealers, Relationship Managers, Branch Managers and Research Analysts — screened for certifications, dealing experience and book quality.",
    bullets: [
      { title: "Equity dealers", body: "NISM-certified dealers screened for terminal experience, compliance record and client handling." },
      { title: "Relationship managers", body: "Broking RMs assessed on book size, revenue history and product breadth." },
      { title: "Branch managers", body: "Leaders who can run P&L, compliance and a dealing desk at once." },
      { title: "Research analysts", body: "Fundamental and technical analysts with verifiable coverage track records." },
    ],
    bestFor: ["Stock broking firms", "Equity & wealth desks", "Regional branch expansion"],
    faq: [
      { question: "Do candidates come NISM-certified?", answer: "For dealer and research roles we screen for the relevant NISM certifications as part of pre-filtering, and flag any that need renewal." },
      { question: "Can you staff a new branch end to end?", answer: "Yes — branch manager, dealers, RMs and operations, hired as a coordinated drive so the branch opens on schedule." },
    ],
  },
];

export function getService(slug: string) {
  return servicesContent.find((s) => s.slug === slug);
}
