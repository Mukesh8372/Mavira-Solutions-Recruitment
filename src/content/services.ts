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
    slug: "permanent-hiring",
    title: "Permanent Hiring",
    icon: "user-check",
    short: "Pre-screened full-time talent on a success-fee model — pay only when they join.",
    headline: "Full-time hires, without the fifty-resume inbox",
    intro:
      "We run the entire funnel — sourcing, screening, scheduling, offer management — and send you a shortlist of three to five candidates who have already been interviewed by a specialist recruiter. Most mid-level roles see a shortlist within five business days.",
    bullets: [
      { title: "Specialist screening", body: "Every candidate is interviewed by a recruiter who works your domain daily — not a generalist reading keywords." },
      { title: "Success-fee only", body: "No retainers, no upfront charges for standard roles. You pay a percentage of CTC when the candidate joins." },
      { title: "Offer management", body: "We benchmark compensation, manage counter-offer risk, and stay engaged until day one — our offer-to-join rate is above 90%." },
      { title: "Replacement guarantee", body: "If a placement exits within the guarantee period, we replace them free. It's in the engagement letter, not the fine print." },
    ],
    bestFor: ["Mid to senior individual contributors", "Team leads and managers", "Replacement and growth hiring"],
    faq: [
      { question: "What does permanent hiring cost?", answer: "A success fee calculated as a percentage of the candidate's annual CTC, payable only on joining. The exact percentage depends on role seniority and hiring volume — request a callback for a quote." },
      { question: "How fast will I see candidates?", answer: "For most mid-level roles, a screened shortlist lands in 3–5 business days after the intake call. Niche or leadership roles take longer, and we'll give you an honest timeline upfront." },
    ],
  },
  {
    slug: "contract-staffing",
    title: "Contract Staffing",
    icon: "file-clock",
    short: "Deploy compliant contract workforce in days — we carry payroll and statutory risk.",
    headline: "Flexible workforce, fully compliant",
    intro:
      "Seasonal peaks, projects, new-market pilots — when headcount needs to flex, we deploy vetted contract staff on our payroll with PF, ESI and statutory compliance handled end to end. You get one consolidated invoice and zero compliance exposure.",
    bullets: [
      { title: "Days, not months", body: "Our bench and sourcing engine can deploy vetted contract staff across India within days for most profiles." },
      { title: "Compliance transferred", body: "PF, ESI, gratuity, minimum wages, labour registers — statutory risk sits with us, audited and documented." },
      { title: "Single invoice", body: "One consolidated monthly invoice replaces dozens of payroll, insurance and vendor line items." },
      { title: "Convert when ready", body: "Contract-to-hire conversion terms are pre-agreed, so you can absorb proven performers without renegotiation." },
    ],
    bestFor: ["Seasonal and project demand", "Warehouse, retail and field ops", "IT contractors and niche specialists"],
    faq: [
      { question: "Who is the legal employer of contract staff?", answer: "TalentBridge. Staff are on our payroll with full statutory coverage; you direct their day-to-day work under the service agreement." },
      { question: "What's the minimum engagement?", answer: "Typically three months per contractor, though shorter project-bound engagements are possible for IT and specialist roles." },
    ],
  },
  {
    slug: "executive-search",
    title: "Executive Search",
    icon: "crown",
    short: "Confidential leadership hiring — CXO, VP and board-level searches with full market mapping.",
    headline: "Leadership searches that stay quiet and close fast",
    intro:
      "Our executive practice runs research-led, confidential searches for CXO, VP and board roles. We map the entire relevant talent market, approach candidates under NDA, and run structured evaluations with your board or nomination committee.",
    bullets: [
      { title: "Research-led mapping", body: "We map 50–100 relevant profiles per search across competitors and adjacent industries before the first approach." },
      { title: "Absolute confidentiality", body: "NDA-covered approaches, anonymised briefs, and disclosure only at mutually agreed stages." },
      { title: "Structured evaluation", body: "Competency-based panels, psychometrics where appropriate, and reference checks that go beyond the provided list." },
      { title: "Partial retainer model", body: "A modest engagement fee, with the balance strictly on successful closure." },
    ],
    bestFor: ["CXO and VP hiring", "Confidential replacements", "Board and advisory appointments"],
    faq: [
      { question: "How long does an executive search take?", answer: "Typical searches close in 6–10 weeks: two weeks of mapping, three to four weeks of evaluation, and two to four weeks of offer and transition management." },
      { question: "Do you work on retained or contingency terms?", answer: "Executive searches follow a partial-retainer model — an engagement fee to commission the research, with the majority payable only on closure." },
    ],
  },
  {
    slug: "bulk-hiring",
    title: "Bulk Hiring",
    icon: "users-round",
    short: "Volume hiring drives — hundreds of vetted joiners for new sites, seasons and expansions.",
    headline: "Hundreds of hires, one accountable partner",
    intro:
      "New facility, festive peak, market expansion — when you need dozens to hundreds of people on a deadline, we run end-to-end hiring drives: multi-channel sourcing, walk-in management, skill checks, same-day offers and joining-day logistics.",
    bullets: [
      { title: "Drive operations", body: "We plan and staff walk-in drives across micro-markets, with screening stations, skill checks and document verification on site." },
      { title: "Same-day offers", body: "Pre-approved offer matrices let us hand over letters on the spot — the single biggest lever on show-up rates." },
      { title: "Retention programs", body: "30-60-90 day check-ins and early-attrition replacement keep your ramp curve intact." },
      { title: "Ramp reporting", body: "A live dashboard tracks pipeline, offers, joins and attrition against the ramp plan, shared weekly." },
    ],
    bestFor: ["New facility launches", "Seasonal/festive ramp-ups", "Field sales and delivery fleets"],
    faq: [
      { question: "What volumes can you handle?", answer: "Our largest single drive staffed 222 people in six weeks. Sustained programs of 50–100 hires a month are routine across our branch network." },
      { question: "How do you control early attrition?", answer: "Realistic job previews at screening, same-day offers, joining-day handholding, and a structured 30-60-90 day check-in program — our 90-day attrition runs at roughly a third of market norms." },
    ],
  },
  {
    slug: "campus-hiring",
    title: "Campus Hiring",
    icon: "graduation-cap",
    short: "Graduate programs at scale — campus partnerships, assessment design and offer logistics.",
    headline: "A campus program your future leaders remember",
    intro:
      "We design and execute campus hiring end to end: college shortlisting by real placement data, employer-brand sessions, proctored assessments, interview panels and pre-joining engagement that keeps offer-drop rates low.",
    bullets: [
      { title: "Data-backed college selection", body: "We select campuses by historical joining and retention data for your role families, not brochures." },
      { title: "Assessment design", body: "Role-relevant aptitude and skill assessments, proctored online or on campus." },
      { title: "Brand on campus", body: "Pre-placement talks, workshops and hackathons that make your company the one students remember." },
      { title: "Offer-to-join care", body: "Structured pre-joining engagement — mentor mapping, internships, community — that protects conversion across the long campus-to-joining gap." },
    ],
    bestFor: ["Graduate engineer/trainee programs", "Management trainee cohorts", "Apprenticeships (NAPS)"],
    faq: [
      { question: "When should we start planning campus hiring?", answer: "Six to eight months before intended joining dates — top campuses lock placement slots early. We can compress this for off-season hiring via pooled drives." },
      { question: "Can you run assessments for large cohorts?", answer: "Yes — our platform partners support proctored assessments for thousands of candidates in parallel, with role-specific test batteries." },
    ],
  },
  {
    slug: "payroll-services",
    title: "Payroll Services",
    icon: "wallet",
    short: "Accurate, compliant payroll outsourcing — PF, ESI, TDS and filings handled.",
    headline: "Payroll that's never late, never non-compliant",
    intro:
      "We run monthly payroll for your workforce — salary processing, payslips, PF/ESI/PT/TDS computation and remittance, statutory registers and returns — with a named account manager and a self-serve portal for your employees.",
    bullets: [
      { title: "Full statutory stack", body: "PF, ESI, professional tax, LWF, TDS and returns — computed, remitted and documented on time, every cycle." },
      { title: "Employee self-service", body: "Payslips, tax declarations and reimbursement claims in a portal, not your HR inbox." },
      { title: "Audit-ready records", body: "Registers and challans maintained per statute, ready for any inspection." },
      { title: "Scales with you", body: "From 20 employees to 2,000 — same SLA, same accuracy." },
    ],
    bestFor: ["Growing companies without payroll teams", "Multi-state workforces", "Contract workforce payroll"],
    faq: [
      { question: "How do you price payroll services?", answer: "Per employee per month, with slabs by headcount. Implementation is typically free for standard setups." },
      { question: "Can you take over mid-year?", answer: "Yes — we migrate YTD data, reconcile statutory balances and run a parallel cycle before cutover so nothing breaks." },
    ],
  },
  {
    slug: "hr-consulting",
    title: "HR Consulting",
    icon: "briefcase-business",
    short: "Policies, compensation benchmarking and org design from practitioners, not templates.",
    headline: "HR foundations that scale with your headcount",
    intro:
      "Employee handbooks, compensation benchmarking, performance frameworks, org design — we build pragmatic HR foundations for growing companies, drawing on live market data from thousands of placements a year.",
    bullets: [
      { title: "Live comp data", body: "Salary benchmarks from our active placement desk — current, city-wise, role-wise — not last year's survey." },
      { title: "Policies that work", body: "Handbooks and policies written for how your company actually operates, compliant with state-specific law." },
      { title: "Performance systems", body: "Goal frameworks and review cycles sized for your stage — not enterprise bureaucracy at 80 people." },
      { title: "Org design", body: "Structures, levels and career paths that remove ambiguity before it becomes attrition." },
    ],
    bestFor: ["Series A–C companies formalising HR", "Comp benchmarking exercises", "Post-merger harmonisation"],
    faq: [
      { question: "How are consulting engagements scoped?", answer: "Fixed-fee by deliverable (e.g. a comp benchmarking report, a handbook) or a monthly advisory retainer — you'll get a clear scope and price before we start." },
      { question: "Do you implement, or just recommend?", answer: "Both. We stay through rollout — manager training, employee communication and the first review cycle — because that's where frameworks usually fail." },
    ],
  },
];

export function getService(slug: string) {
  return servicesContent.find((s) => s.slug === slug);
}
