import { PrismaClient, WorkMode, EmploymentType, JobStatus } from "@prisma/client";
import { hashSync } from "bcryptjs";

const db = new PrismaClient();

const j = (v: unknown) => JSON.stringify(v) as unknown as string;

const departments = [
  { name: "Information Technology", slug: "information-technology", icon: "monitor" },
  { name: "Sales & Marketing", slug: "sales-marketing", icon: "megaphone" },
  { name: "Finance & Accounting", slug: "finance-accounting", icon: "calculator" },
  { name: "Human Resources", slug: "human-resources", icon: "users" },
  { name: "Engineering & Manufacturing", slug: "engineering-manufacturing", icon: "factory" },
  { name: "Healthcare & Pharma", slug: "healthcare-pharma", icon: "heart-pulse" },
  { name: "Operations & Logistics", slug: "operations-logistics", icon: "truck" },
  { name: "Customer Support", slug: "customer-support", icon: "headset" },
  { name: "Design & Creative", slug: "design-creative", icon: "pen-tool" },
  { name: "Administration", slug: "administration", icon: "clipboard-list" },
];

const industries = [
  { name: "Information Technology", slug: "information-technology", icon: "cpu", description: "Product companies, IT services, SaaS and deep-tech startups." },
  { name: "Banking & Financial Services", slug: "banking-financial-services", icon: "landmark", description: "Banks, NBFCs, fintech, insurance and wealth management." },
  { name: "Healthcare", slug: "healthcare", icon: "stethoscope", description: "Hospitals, diagnostics, medical devices and pharma." },
  { name: "Manufacturing", slug: "manufacturing", icon: "factory", description: "Auto, FMCG, industrial equipment and process manufacturing." },
  { name: "Retail & E-commerce", slug: "retail-ecommerce", icon: "shopping-bag", description: "Omnichannel retail, D2C brands and marketplaces." },
  { name: "Logistics & Supply Chain", slug: "logistics-supply-chain", icon: "truck", description: "3PL, warehousing, last-mile and freight networks." },
  { name: "Hospitality", slug: "hospitality", icon: "concierge-bell", description: "Hotels, QSR chains, travel and facilities management." },
  { name: "Engineering & Infrastructure", slug: "engineering-infrastructure", icon: "hard-hat", description: "EPC, construction, energy and smart infrastructure." },
];

const companies = [
  { name: "Finlark Technologies", slug: "finlark-technologies", industry: "Information Technology", size: "201-500", about: "Fintech product company building payment infrastructure for SMEs." },
  { name: "Medanta Diagnostics", slug: "medanta-diagnostics", industry: "Healthcare", size: "501-1000", about: "Pan-India diagnostics chain with 120+ collection centres." },
  { name: "Movox Logistics", slug: "movox-logistics", industry: "Logistics & Supply Chain", size: "1000+", about: "Tech-enabled 3PL running warehousing and last-mile delivery." },
  { name: "UrbanNest Retail", slug: "urbannest-retail", industry: "Retail & E-commerce", size: "501-1000", about: "Home & living D2C brand with 40 experience stores." },
  { name: "Sterling Gears", slug: "sterling-gears", industry: "Manufacturing", size: "201-500", about: "Precision auto components manufacturer exporting to 14 countries." },
  { name: "Crestline Bank", slug: "crestline-bank", industry: "Banking & Financial Services", size: "1000+", about: "Mid-size private bank focused on retail and SME lending." },
  { name: "Bluepeak Software", slug: "bluepeak-software", industry: "Information Technology", size: "51-200", about: "Enterprise SaaS for supply-chain visibility." },
  { name: "Verdant Hotels", slug: "verdant-hotels", industry: "Hospitality", size: "501-1000", about: "Boutique business-hotel chain across 12 cities." },
  { name: "NovaCare Pharma", slug: "novacare-pharma", industry: "Healthcare", size: "201-500", about: "Formulations manufacturer with WHO-GMP certified plants." },
  { name: "GridAxis Energy", slug: "gridaxis-energy", industry: "Engineering & Infrastructure", size: "201-500", about: "Solar EPC and grid-storage solutions." },
  { name: "Kartloop", slug: "kartloop", industry: "Retail & E-commerce", size: "51-200", about: "Quick-commerce startup operating in 8 metros." },
  { name: "Apex HR Services", slug: "apex-hr-services", industry: "Information Technology", size: "11-50", about: "Payroll and compliance outsourcing partner." },
];

type SeedJob = {
  title: string; dept: string; industry: string; company: string; location: string;
  mode: WorkMode; type: EmploymentType; expMin: number; expMax: number;
  salMin: number; salMax: number; featured?: boolean; urgent?: boolean;
  skills: string[]; summary: string;
};

const jobs: SeedJob[] = [
  { title: "Senior React Developer", dept: "information-technology", industry: "information-technology", company: "finlark-technologies", location: "Bengaluru", mode: "HYBRID", type: "FULL_TIME", expMin: 5, expMax: 8, salMin: 2800000, salMax: 3600000, featured: true, skills: ["React", "TypeScript", "Next.js", "GraphQL", "AWS"], summary: "Own the web platform for our payments dashboard used by 40,000 merchants." },
  { title: "Backend Engineer (Node.js)", dept: "information-technology", industry: "information-technology", company: "bluepeak-software", location: "Pune", mode: "REMOTE", type: "FULL_TIME", expMin: 3, expMax: 6, salMin: 1800000, salMax: 2600000, featured: true, skills: ["Node.js", "PostgreSQL", "Redis", "Kubernetes"], summary: "Build high-throughput APIs for our supply-chain visibility platform." },
  { title: "DevOps Engineer", dept: "information-technology", industry: "information-technology", company: "finlark-technologies", location: "Bengaluru", mode: "HYBRID", type: "FULL_TIME", expMin: 4, expMax: 7, salMin: 2400000, salMax: 3200000, skills: ["AWS", "Terraform", "CI/CD", "Docker"], summary: "Run infrastructure for a PCI-DSS compliant payments stack." },
  { title: "Data Analyst", dept: "information-technology", industry: "banking-financial-services", company: "crestline-bank", location: "Mumbai", mode: "ONSITE", type: "FULL_TIME", expMin: 2, expMax: 5, salMin: 1200000, salMax: 1800000, skills: ["SQL", "Power BI", "Python"], summary: "Drive credit-risk analytics for the retail lending portfolio." },
  { title: "QA Automation Engineer", dept: "information-technology", industry: "information-technology", company: "bluepeak-software", location: "Pune", mode: "HYBRID", type: "FULL_TIME", expMin: 3, expMax: 6, salMin: 1400000, salMax: 2000000, skills: ["Playwright", "TypeScript", "API Testing"], summary: "Own end-to-end quality for enterprise SaaS releases." },
  { title: "Product Manager — Payments", dept: "information-technology", industry: "information-technology", company: "finlark-technologies", location: "Bengaluru", mode: "HYBRID", type: "FULL_TIME", expMin: 6, expMax: 10, salMin: 3500000, salMax: 4800000, featured: true, skills: ["Product Strategy", "Payments", "Analytics"], summary: "Lead the merchant onboarding and KYC product line." },
  { title: "Regional Sales Manager", dept: "sales-marketing", industry: "retail-ecommerce", company: "urbannest-retail", location: "Delhi NCR", mode: "ONSITE", type: "FULL_TIME", expMin: 6, expMax: 10, salMin: 1800000, salMax: 2400000, featured: true, skills: ["Retail Sales", "Team Leadership", "P&L"], summary: "Own revenue for 12 stores across North India." },
  { title: "Digital Marketing Lead", dept: "sales-marketing", industry: "retail-ecommerce", company: "kartloop", location: "Gurugram", mode: "HYBRID", type: "FULL_TIME", expMin: 4, expMax: 8, salMin: 1600000, salMax: 2400000, skills: ["Performance Marketing", "SEO", "CRM"], summary: "Scale paid and organic growth for quick-commerce in 8 metros." },
  { title: "Inside Sales Executive", dept: "sales-marketing", industry: "information-technology", company: "apex-hr-services", location: "Noida", mode: "ONSITE", type: "FULL_TIME", expMin: 1, expMax: 3, salMin: 400000, salMax: 700000, skills: ["B2B Sales", "Cold Calling", "CRM"], summary: "Generate qualified pipeline for payroll outsourcing services." },
  { title: "Finance Controller", dept: "finance-accounting", industry: "manufacturing", company: "sterling-gears", location: "Chennai", mode: "ONSITE", type: "FULL_TIME", expMin: 8, expMax: 12, salMin: 3000000, salMax: 4000000, featured: true, skills: ["Controllership", "SAP", "Costing", "IndAS"], summary: "Lead plant finance for a precision components exporter." },
  { title: "Accounts Payable Specialist", dept: "finance-accounting", industry: "hospitality", company: "verdant-hotels", location: "Mumbai", mode: "ONSITE", type: "FULL_TIME", expMin: 2, expMax: 4, salMin: 500000, salMax: 800000, skills: ["Tally", "GST", "Vendor Management"], summary: "Manage AP across 12 hotel properties." },
  { title: "Credit Risk Analyst", dept: "finance-accounting", industry: "banking-financial-services", company: "crestline-bank", location: "Mumbai", mode: "HYBRID", type: "FULL_TIME", expMin: 3, expMax: 6, salMin: 1400000, salMax: 2200000, skills: ["Credit Underwriting", "SQL", "Risk Models"], summary: "Strengthen SME lending risk frameworks." },
  { title: "HR Business Partner", dept: "human-resources", industry: "information-technology", company: "bluepeak-software", location: "Pune", mode: "HYBRID", type: "FULL_TIME", expMin: 5, expMax: 8, salMin: 1600000, salMax: 2200000, skills: ["HRBP", "Talent Management", "Employee Relations"], summary: "Partner with engineering leadership on a 200-person org." },
  { title: "Talent Acquisition Specialist", dept: "human-resources", industry: "healthcare", company: "medanta-diagnostics", location: "Gurugram", mode: "ONSITE", type: "FULL_TIME", expMin: 2, expMax: 5, salMin: 600000, salMax: 1000000, skills: ["Sourcing", "Healthcare Hiring", "ATS"], summary: "Hire clinical and operations talent for 120+ centres." },
  { title: "Production Supervisor", dept: "engineering-manufacturing", industry: "manufacturing", company: "sterling-gears", location: "Chennai", mode: "ONSITE", type: "FULL_TIME", expMin: 4, expMax: 8, salMin: 700000, salMax: 1100000, urgent: true, skills: ["CNC", "Lean Manufacturing", "5S"], summary: "Run a 60-member machining shift with lean discipline." },
  { title: "Quality Engineer", dept: "engineering-manufacturing", industry: "manufacturing", company: "novacare-pharma", location: "Ahmedabad", mode: "ONSITE", type: "FULL_TIME", expMin: 3, expMax: 6, salMin: 800000, salMax: 1200000, skills: ["QMS", "GMP", "Audits"], summary: "Own batch quality for WHO-GMP certified formulation lines." },
  { title: "Solar Project Engineer", dept: "engineering-manufacturing", industry: "engineering-infrastructure", company: "gridaxis-energy", location: "Jaipur", mode: "ONSITE", type: "CONTRACT", expMin: 3, expMax: 7, salMin: 900000, salMax: 1400000, skills: ["Solar EPC", "AutoCAD", "Site Execution"], summary: "Execute 50MW+ utility-scale solar installations." },
  { title: "Staff Nurse (ICU)", dept: "healthcare-pharma", industry: "healthcare", company: "medanta-diagnostics", location: "Delhi NCR", mode: "ONSITE", type: "FULL_TIME", expMin: 2, expMax: 6, salMin: 450000, salMax: 750000, urgent: true, skills: ["Critical Care", "BLS/ACLS", "Patient Care"], summary: "Join a 40-bed ICU team with structured growth pathways." },
  { title: "Medical Representative", dept: "healthcare-pharma", industry: "healthcare", company: "novacare-pharma", location: "Lucknow", mode: "ONSITE", type: "FULL_TIME", expMin: 1, expMax: 4, salMin: 350000, salMax: 600000, skills: ["Pharma Sales", "Doctor Engagement"], summary: "Grow prescriptions for cardio-diabetic portfolio." },
  { title: "Warehouse Shift Supervisor", dept: "operations-logistics", industry: "logistics-supply-chain", company: "movox-logistics", location: "Pune", mode: "ONSITE", type: "CONTRACT", expMin: 2, expMax: 5, salMin: 450000, salMax: 600000, urgent: true, featured: true, skills: ["WMS", "Team Handling", "Inventory"], summary: "Run a 100,000 sq ft fulfilment centre shift." },
  { title: "Fleet Operations Manager", dept: "operations-logistics", industry: "logistics-supply-chain", company: "movox-logistics", location: "Bengaluru", mode: "ONSITE", type: "FULL_TIME", expMin: 5, expMax: 9, salMin: 1200000, salMax: 1800000, skills: ["Fleet Management", "Route Planning", "Vendor Ops"], summary: "Own last-mile fleet performance across Karnataka." },
  { title: "Customer Success Manager", dept: "customer-support", industry: "information-technology", company: "bluepeak-software", location: "Remote", mode: "REMOTE", type: "FULL_TIME", expMin: 3, expMax: 6, salMin: 1200000, salMax: 1800000, skills: ["SaaS Onboarding", "Renewals", "Stakeholder Management"], summary: "Drive adoption and renewals for enterprise accounts." },
  { title: "Support Team Lead (Voice)", dept: "customer-support", industry: "retail-ecommerce", company: "kartloop", location: "Gurugram", mode: "ONSITE", type: "FULL_TIME", expMin: 3, expMax: 6, salMin: 600000, salMax: 900000, skills: ["Team Leadership", "CSAT", "Escalations"], summary: "Lead a 25-agent support pod for quick-commerce." },
  { title: "Product Designer", dept: "design-creative", industry: "information-technology", company: "finlark-technologies", location: "Bengaluru", mode: "HYBRID", type: "FULL_TIME", expMin: 4, expMax: 8, salMin: 2200000, salMax: 3200000, featured: true, skills: ["Figma", "Design Systems", "User Research"], summary: "Design merchant-facing payment experiences end to end." },
  { title: "Graphic Designer", dept: "design-creative", industry: "retail-ecommerce", company: "urbannest-retail", location: "Delhi NCR", mode: "HYBRID", type: "FULL_TIME", expMin: 2, expMax: 5, salMin: 600000, salMax: 1000000, skills: ["Adobe CC", "Brand Design", "Motion Basics"], summary: "Own campaign creative for a fast-growing D2C brand." },
  { title: "Executive Assistant to CEO", dept: "administration", industry: "banking-financial-services", company: "crestline-bank", location: "Mumbai", mode: "ONSITE", type: "FULL_TIME", expMin: 5, expMax: 10, salMin: 1000000, salMax: 1500000, skills: ["Calendar Management", "Stakeholder Comms", "Discretion"], summary: "Support the CEO's office of a listed private bank." },
  { title: "Front Office Executive", dept: "administration", industry: "hospitality", company: "verdant-hotels", location: "Goa", mode: "ONSITE", type: "FULL_TIME", expMin: 1, expMax: 3, salMin: 300000, salMax: 450000, skills: ["Guest Relations", "PMS", "Communication"], summary: "Deliver five-star first impressions at our flagship property." },
  { title: "React Native Developer", dept: "information-technology", industry: "retail-ecommerce", company: "kartloop", location: "Gurugram", mode: "HYBRID", type: "FULL_TIME", expMin: 3, expMax: 6, salMin: 1800000, salMax: 2600000, skills: ["React Native", "TypeScript", "GraphQL"], summary: "Ship the consumer app used by 2M monthly shoppers." },
  { title: "Machine Learning Engineer", dept: "information-technology", industry: "logistics-supply-chain", company: "movox-logistics", location: "Bengaluru", mode: "HYBRID", type: "FULL_TIME", expMin: 4, expMax: 8, salMin: 2600000, salMax: 3800000, skills: ["Python", "ML Ops", "Forecasting"], summary: "Build demand forecasting and route optimisation models." },
  { title: "Payroll Executive", dept: "human-resources", industry: "information-technology", company: "apex-hr-services", location: "Noida", mode: "ONSITE", type: "FULL_TIME", expMin: 2, expMax: 4, salMin: 400000, salMax: 650000, skills: ["Payroll", "PF/ESI", "Excel"], summary: "Process multi-client payroll with statutory compliance." },
  { title: "Store Manager", dept: "sales-marketing", industry: "retail-ecommerce", company: "urbannest-retail", location: "Hyderabad", mode: "ONSITE", type: "FULL_TIME", expMin: 4, expMax: 8, salMin: 800000, salMax: 1200000, skills: ["Retail Ops", "Visual Merchandising", "Team Handling"], summary: "Run our newest 8,000 sq ft experience store." },
  { title: "Procurement Manager", dept: "operations-logistics", industry: "manufacturing", company: "sterling-gears", location: "Chennai", mode: "ONSITE", type: "FULL_TIME", expMin: 6, expMax: 10, salMin: 1500000, salMax: 2200000, skills: ["Strategic Sourcing", "Vendor Development", "SAP MM"], summary: "Lead raw-material sourcing for export production lines." },
  { title: "Content Marketing Intern", dept: "sales-marketing", industry: "information-technology", company: "bluepeak-software", location: "Remote", mode: "REMOTE", type: "INTERNSHIP", expMin: 0, expMax: 1, salMin: 240000, salMax: 300000, skills: ["Writing", "SEO Basics", "Social Media"], summary: "Learn B2B content marketing with a full-time path." },
];

const testimonials = [
  { authorName: "Priya Sharma", authorRole: "Head of HR", company: "Finlark Technologies", quote: "Three shortlisted candidates in four days. We closed a role that had been open for two months. TalentBridge's screening is the best we've worked with.", kind: "CLIENT", featured: true },
  { authorName: "Rajesh Iyer", authorRole: "Plant Director", company: "Sterling Gears", quote: "They staffed an entire production shift — 60 people — in five weeks, with attrition under 4% in the first year. Remarkable execution.", kind: "CLIENT", featured: true },
  { authorName: "Meera Krishnan", authorRole: "COO", company: "Verdant Hotels", quote: "From front office to F&B leadership, they understand hospitality talent. Our time-to-fill dropped from 45 days to 16.", kind: "CLIENT", featured: true },
  { authorName: "Arjun Nair", authorRole: "Senior React Developer", company: "Placed at Finlark", quote: "One honest conversation about what I wanted, then two interviews that actually matched it. Offer in eleven days, 40% hike. I've already referred three friends.", kind: "CANDIDATE", featured: true },
  { authorName: "Sneha Patil", authorRole: "Talent Acquisition Specialist", company: "Placed at Medanta", quote: "As a fresher I had no idea how to position myself. Their free resume review and mock interview changed everything — I had an offer within three weeks.", kind: "CANDIDATE", featured: true },
  { authorName: "Vikram Malhotra", authorRole: "Fleet Operations Manager", company: "Placed at Movox", quote: "They kept me informed at every stage — no black holes, no ghosting. That alone puts them ahead of every agency I've dealt with.", kind: "CANDIDATE", featured: true },
];

const stories = [
  {
    slug: "finlark-engineering-scale-up", title: "Scaling Finlark's engineering team 3× in two quarters",
    clientName: "Finlark Technologies", industry: "Fintech",
    challenge: "A Series-C payments company needed 34 senior engineers, designers and PMs in six months while holding a 12% offer-decline rate.",
    solution: "A dedicated pod of two tech recruiters ran structured intake with hiring managers, pre-assessed candidates on a shared rubric, and managed offers with weekly comp benchmarking.",
    results: ["34 roles closed in 22 weeks", "Offer-decline rate cut from 12% to 4%", "91% of hires passed probation with top ratings"],
    metrics: [{ label: "Roles closed", value: "34" }, { label: "Avg. time-to-offer", value: "19 days" }, { label: "First-year retention", value: "94%" }],
  },
  {
    slug: "movox-warehouse-bulk-hiring", title: "Staffing a new fulfilment hub: 210 hires in six weeks",
    clientName: "Movox Logistics", industry: "Logistics",
    challenge: "A new 100,000 sq ft fulfilment centre had to be fully staffed — supervisors to pickers — before peak season, in a market with 30%+ attrition norms.",
    solution: "Bulk-hiring drives across three micro-markets, structured skill checks, same-day offer letters, and a 30-60-90 day retention program with the client's HR team.",
    results: ["210 associates and 12 supervisors onboarded in 6 weeks", "Peak season handled at 99.2% SLA", "90-day attrition at 11% vs 30% market norm"],
    metrics: [{ label: "Hires", value: "222" }, { label: "Ramp time", value: "6 weeks" }, { label: "90-day attrition", value: "11%" }],
  },
  {
    slug: "crestline-leadership-search", title: "A confidential CFO search closed in seven weeks",
    clientName: "Crestline Bank", industry: "Banking",
    challenge: "A listed private bank needed a CFO with capital-markets depth — confidentially, without unsettling the street or internal teams.",
    solution: "Our executive search practice mapped 60 profiles across banking and NBFCs, approached 14 under NDA, and ran a three-stage evaluation with the board's nomination committee.",
    results: ["Closed in 49 days end to end", "Zero market leakage", "Shortlist of 5, all board-approved as interview-worthy"],
    metrics: [{ label: "Search duration", value: "7 weeks" }, { label: "Profiles mapped", value: "60" }, { label: "Shortlist accepted", value: "5/5" }],
  },
];

const blogPosts = [
  {
    slug: "resume-mistakes-that-cost-interviews", title: "7 resume mistakes that quietly cost you interviews",
    category: "career-advice", tags: ["resume", "job-search"], readMinutes: 6,
    excerpt: "Recruiters spend under 30 seconds on a first pass. Here's what makes them stop reading — and what makes them shortlist you.",
    content: "## The 30-second reality\n\nRecruiters reviewing a hundred applications for one role don't read resumes — they scan them. In our placement desk's experience, seven fixable mistakes account for most early rejections.\n\n### 1. A summary that says nothing\nReplace \"hard-working professional seeking growth\" with one line of evidence: *\"Backend engineer, 5 years, scaled payment APIs from 2M to 40M requests/day.\"*\n\n### 2. Responsibilities instead of results\n\"Managed social media\" is a job description. \"Grew Instagram from 8k to 60k followers in 9 months, driving 20% of D2C revenue\" is a resume line.\n\n### 3. One resume for every job\nMirror the language of the job description for your top three skills. Applicant tracking systems — and humans — match keywords first.\n\n### 4. Burying the last five years\nYour most recent role should take the most space. Nobody shortlists you for what you did in 2015.\n\n### 5. Unexplained gaps\nA one-line explanation (\"family care\", \"sabbatical + certification\") beats a silent gap every time.\n\n### 6. Design over readability\nSingle column, standard fonts, no photos, PDF format. Clever layouts break ATS parsing.\n\n### 7. No numbers anywhere\nTeam size, budget, revenue, growth, time saved. If a line has no number, ask whether it's earning its place.\n\n**Want a free review?** Upload your resume and our placement team will send you three specific improvements within two business days.",
  },
  {
    slug: "structured-interviews-hiring-quality", title: "Why structured interviews beat gut feel — and how to run one",
    category: "hiring-insights", tags: ["interviewing", "hiring"], readMinutes: 7,
    excerpt: "Unstructured interviews predict job performance barely better than chance. A repeatable rubric changes that — here's the playbook we use.",
    content: "## Gut feel is expensive\n\nDecades of selection research agree: unstructured interviews are among the weakest predictors of job performance, yet they remain the default. The fix isn't complicated.\n\n### Write the rubric before the first interview\nDefine 4–6 competencies the role actually needs. For each, write what a strong, adequate and weak answer sounds like. Every interviewer scores against the same scale.\n\n### Ask the same core questions\nComparability is the point. You can probe follow-ups freely, but the spine of the interview stays constant across candidates.\n\n### Prefer behavioral evidence\n\"Tell me about a time you missed a deadline\" reveals more than \"How do you handle pressure?\" Past behavior beats hypotheticals.\n\n### Score independently, then discuss\nCollect written scores before any debrief. The first strong opinion in the room anchors everyone else — independence protects you.\n\n### Watch your funnel data\nIf 80% of candidates fail the same stage, the problem is usually the stage, not the candidates.\n\nAt TalentBridge we run this rubric with every client shortlist — it's a large part of why our offer-to-join rate stays above 90%.",
  },
  {
    slug: "salary-negotiation-guide-india", title: "The professional's guide to salary negotiation in India",
    category: "career-advice", tags: ["salary", "negotiation"], readMinutes: 8,
    excerpt: "Negotiating well isn't about aggression — it's about timing, benchmarks and knowing your walk-away number before the first call.",
    content: "## Negotiation starts before the offer\n\nMost candidates negotiate at the worst moment — after an offer, with no leverage prepared. The work happens earlier.\n\n### Know the band\nResearch the realistic band for your role, city and company stage. Placement consultants see hundreds of offers a year; ask one.\n\n### Anchor with your number, carefully\nWhen asked for expectations early, give a researched range with a reason: \"Similar roles at product companies in Bengaluru are closing at 24–28 LPA; given my platform experience I'm targeting the upper end.\"\n\n### Never negotiate against yourself\nIf they say the budget is lower, ask what's flexible — joining bonus, ESOPs, review timeline — before conceding base.\n\n### Get the counter-offer trap clear\nAccepting a counter-offer from your current employer statistically shortens tenure. Decide your walk-away terms before resigning conversations start.\n\n### Close gracefully\nOnce terms are right, accept quickly and in writing. Dragged-out acceptances sour teams before you join.",
  },
  {
    slug: "contract-staffing-vs-permanent-hiring", title: "Contract staffing vs permanent hiring: a cost model for 2026",
    category: "hiring-insights", tags: ["contract-staffing", "workforce-planning"], readMinutes: 6,
    excerpt: "When does contract staffing actually save money? We modeled the real costs — compliance, ramp, attrition — so you don't have to guess.",
    content: "## The real comparison isn't salary\n\nComparing a contractor's monthly cost with a permanent CTC misses most of the equation. The variables that decide it:\n\n### Where contract wins\n- **Demand volatility**: seasonal peaks, project-bound work, new-market pilots\n- **Speed**: staffing agencies can deploy vetted contract staff in days\n- **Compliance transfer**: PF, ESI, gratuity and statutory risk sit with the staffing partner\n\n### Where permanent wins\n- **Institutional knowledge**: roles where 12-month ramp-up is real\n- **Retention-sensitive functions**: customer relationships, core engineering\n- **Employer brand**: heavy contractor mix in core teams reads poorly to candidates\n\n### The hybrid pattern that works\nMost of our mid-market clients converge on a 70/20/10 model: 70% permanent core, 20% contract flex, 10% project specialists. Model your own mix before your next planning cycle — or ask us to do it with you.",
  },
  {
    slug: "first-90-days-new-job", title: "Your first 90 days: turning a new job into a career move",
    category: "career-advice", tags: ["career-growth", "onboarding"], readMinutes: 5,
    excerpt: "The habits you set in the first quarter shape your trajectory for years. A placement consultant's field notes on starting strong.",
    content: "## Days 1–30: Learn the real org chart\nEvery company has two structures — the one on paper and the one that ships decisions. Book 15-minute coffees widely. Ask each person: what does success in my role look like from where you sit?\n\n## Days 31–60: Ship something visible\nPick one meaningful, achievable win and deliver it completely. Early credibility compounds; half-finished ambition doesn't.\n\n## Days 61–90: Close the loop with your manager\nBring a one-page summary: what you've learned, delivered, and plan next quarter. Ask directly: \"What would make you rate my start a 9/10?\"\n\n## The habit that outlasts 90 days\nKeep a weekly wins file. Every appraisal, negotiation and future job search draws from it — and future-you will thank present-you.",
  },
  {
    slug: "ai-in-recruitment-2026", title: "AI in recruitment: what actually works in 2026",
    category: "industry-news", tags: ["ai", "recruitment-tech"], readMinutes: 6,
    excerpt: "Past the hype cycle: where AI genuinely improves hiring outcomes, where it quietly adds bias, and what we use at TalentBridge.",
    content: "## What's working\n\n**Sourcing expansion.** Semantic matching surfaces candidates keyword search misses — career-changers, adjacent-skill profiles. Genuine gains.\n\n**Scheduling and coordination.** Interview logistics automation removed days from most funnels.\n\n**Structured-note assistance.** Transcript summarization against a rubric makes debriefs faster and, importantly, more evidence-based.\n\n## What isn't\n\n**Fully automated screening.** Resume-rejection models trained on historical hires replicate historical bias. We keep humans on every reject decision.\n\n**Personality inference.** Tools claiming to infer soft skills from video are scientifically weak — several jurisdictions now regulate them.\n\n## Our stance\nAI compresses recruiter busywork; judgment stays human. Every candidate a client sees has been interviewed by a person on our team — that's not nostalgia, it's quality control.",
  },
];

const faqs = [
  { question: "What does it cost to hire through TalentBridge?", answer: "For employers, we work on a success-fee model — you pay only when a candidate joins, as a percentage of annual CTC that varies by role seniority and volume. Contract staffing and payroll services are priced per head per month. There are no upfront or retainer fees for standard hiring; executive search follows a partial-retainer model. Request a callback for an exact quote.", audience: "EMPLOYER", order: 1 },
  { question: "How fast can you share a shortlist?", answer: "For most mid-level roles you'll see a screened shortlist within 3–5 business days of the intake call. Bulk and entry-level drives move faster; niche leadership searches take longer and we'll tell you honestly upfront.", audience: "EMPLOYER", order: 2 },
  { question: "Do you offer a replacement guarantee?", answer: "Yes. Permanent placements carry a free-replacement guarantee — typically 90 days — if the candidate exits or is released for performance in that window. Terms are stated clearly in our engagement letter.", audience: "EMPLOYER", order: 3 },
  { question: "Is your service free for job seekers?", answer: "Completely. We never charge candidates at any stage — no registration fees, no 'processing' charges, no deductions from your salary. Our fees come from employers. Anyone demanding money in our name is committing fraud; please report it to us immediately.", audience: "CANDIDATE", order: 4 },
  { question: "How do I apply for a job?", answer: "Browse current openings, open a role, and apply with your resume — it takes under two minutes and you don't need an account first. We create your candidate profile automatically so you can track your application status, and you can also upload your resume to our general talent pool for future matches.", audience: "CANDIDATE", order: 5 },
  { question: "Will I hear back after applying?", answer: "Yes — every application gets a status you can track from your dashboard: screening, shortlisted, interview, offer. If a role closes or you're not shortlisted, we tell you rather than leaving you guessing.", audience: "CANDIDATE", order: 6 },
  { question: "Which cities and industries do you cover?", answer: "We place candidates across India, with delivery teams in Delhi NCR, Mumbai, Bengaluru, Pune, Chennai and Hyderabad, and we cover IT, BFSI, healthcare, manufacturing, retail, logistics, hospitality and infrastructure. Remote roles are tagged clearly in our job listings.", audience: "GENERAL", order: 7 },
  { question: "What makes TalentBridge different from other agencies?", answer: "Three things: every candidate is interviewed by a specialist recruiter before reaching a client (no resume-dumping); both sides get transparent status tracking; and our numbers are public — 12,000+ placements, 90%+ offer-to-join rate, 4.9★ Google rating.", audience: "GENERAL", order: 8 },
];

async function main() {
  console.log("Seeding…");

  // Wipe (dev convenience — order matters for FKs)
  await db.auditLog.deleteMany();
  await db.notification.deleteMany();
  await db.interview.deleteMany();
  await db.application.deleteMany();
  await db.savedJob.deleteMany();
  await db.resume.deleteMany();
  await db.job.deleteMany();
  await db.employerProfile.deleteMany();
  await db.candidateProfile.deleteMany();
  await db.blogPost.deleteMany();
  await db.user.deleteMany();
  await db.company.deleteMany();
  await db.department.deleteMany();
  await db.industry.deleteMany();
  await db.testimonial.deleteMany();
  await db.successStory.deleteMany();
  await db.lead.deleteMany();
  await db.contactQuery.deleteMany();
  await db.newsletterSubscriber.deleteMany();
  await db.faqItem.deleteMany();
  await db.setting.deleteMany();

  const deptMap = new Map<string, string>();
  for (const d of departments) {
    const row = await db.department.create({ data: d });
    deptMap.set(d.slug, row.id);
  }
  const indMap = new Map<string, string>();
  for (const i of industries) {
    const row = await db.industry.create({ data: i });
    indMap.set(i.slug, row.id);
  }
  const coMap = new Map<string, string>();
  for (const c of companies) {
    const row = await db.company.create({ data: c });
    coMap.set(c.slug, row.id);
  }

  const password = hashSync("Password@123", 12);
  const admin = await db.user.create({
    data: { email: "admin@talentbridge.dev", name: "Admin User", role: "ADMIN", passwordHash: password, emailVerified: new Date() },
  });
  const employerUser = await db.user.create({
    data: {
      email: "employer@talentbridge.dev", name: "Priya Sharma", role: "EMPLOYER", passwordHash: password, emailVerified: new Date(),
      employerProfile: { create: { companyId: coMap.get("finlark-technologies")!, designation: "Head of HR" } },
    },
  });
  const candidateUser = await db.user.create({
    data: {
      email: "candidate@talentbridge.dev", name: "Arjun Nair", role: "CANDIDATE", passwordHash: password, emailVerified: new Date(), phone: "+91 98765 43210",
      candidateProfile: {
        create: {
          headline: "Senior Frontend Engineer", experienceYears: 6, location: "Bengaluru",
          expectedSalary: 3200000, skills: j(["React", "TypeScript", "Next.js", "Node.js"]), profileScore: 80,
          summary: "Frontend engineer with 6 years across fintech and SaaS; led design-system adoption at two startups.",
        },
      },
    },
    include: { candidateProfile: true },
  });

  const now = Date.now();
  const day = 86_400_000;
  const jobIds: string[] = [];
  for (let idx = 0; idx < jobs.length; idx++) {
    const sj = jobs[idx];
    const shortId = Math.random().toString(36).slice(2, 6);
    const slug = `${sj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${sj.location.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${shortId}`;
    const publishedAt = new Date(now - (idx % 21) * day - 3_600_000);
    const row = await db.job.create({
      data: {
        slug, title: sj.title, location: sj.location, workMode: sj.mode, employmentType: sj.type,
        experienceMin: sj.expMin, experienceMax: sj.expMax, salaryMin: sj.salMin, salaryMax: sj.salMax,
        featured: !!sj.featured, urgent: !!sj.urgent, status: JobStatus.PUBLISHED, publishedAt,
        validThrough: new Date(now + 45 * day),
        viewCount: 120 + Math.floor(Math.random() * 2400),
        departmentId: deptMap.get(sj.dept)!, industryId: indMap.get(sj.industry)!, companyId: coMap.get(sj.company)!,
        postedById: admin.id,
        description: `${sj.summary} You will join a team that values ownership, clear communication and craft. This role offers real scope for growth, direct access to decision-makers, and work that ships to production — not endless process. TalentBridge is managing this search on behalf of the client; every application is reviewed by a specialist recruiter and you can track your status at every stage.`,
        responsibilities: j([
          `Own key outcomes for the ${sj.title.toLowerCase()} function and report progress transparently`,
          "Collaborate with cross-functional stakeholders to plan and deliver against quarterly goals",
          "Raise the bar on quality — reviews, documentation and process improvements",
          "Mentor junior team members and contribute to a healthy team culture",
          "Represent your function in leadership reviews with data-backed updates",
        ]),
        requirements: j([
          `${sj.expMin}–${sj.expMax} years of relevant experience`,
          `Demonstrated depth in ${sj.skills.slice(0, 3).join(", ")}`,
          "Strong written and verbal communication",
          "Comfort operating with ambiguity in a fast-moving environment",
        ]),
        benefits: j([
          "Competitive compensation with performance bonus",
          "Comprehensive health insurance for you and dependents",
          sj.mode === "REMOTE" ? "Fully remote with quarterly team offsites" : sj.mode === "HYBRID" ? "Hybrid working (3 days in office)" : "On-site role with commute allowance",
          "Structured learning budget and certification support",
        ]),
        skills: j(sj.skills),
      },
    });
    jobIds.push(row.id);
  }

  // Applications for the demo candidate
  const statuses = ["APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW"] as const;
  for (let i = 0; i < 4; i++) {
    const app = await db.application.create({
      data: {
        jobId: jobIds[i], candidateId: candidateUser.candidateProfile!.id, status: statuses[i],
        coverNote: "I've spent the last six years building exactly this kind of product and would love to talk.",
        statusHistory: j([{ status: "APPLIED", at: new Date(now - (10 - i) * day).toISOString() }]),
        source: "website", createdAt: new Date(now - (10 - i) * day),
      },
    });
    if (statuses[i] === "INTERVIEW") {
      await db.interview.create({
        data: { applicationId: app.id, scheduledAt: new Date(now + 2 * day), mode: "VIDEO", meetingUrl: "https://meet.google.com/demo", interviewer: "Rohit Menon (Engineering Manager)" },
      });
    }
  }
  await db.savedJob.createMany({
    data: [jobIds[5], jobIds[22]].map((jobId) => ({ jobId, candidateId: candidateUser.candidateProfile!.id })),
  });

  for (const t of testimonials) await db.testimonial.create({ data: { ...t, approved: true } });
  for (const s of stories) await db.successStory.create({ data: { ...s, results: j(s.results), metrics: j(s.metrics) } });
  for (let i = 0; i < blogPosts.length; i++) {
    const p = blogPosts[i];
    await db.blogPost.create({
      data: { ...p, tags: j(p.tags), authorId: admin.id, status: "PUBLISHED", publishedAt: new Date(now - i * 9 * day) },
    });
  }
  for (const f of faqs) await db.faqItem.create({ data: f });

  await db.lead.createMany({
    data: [
      { kind: "REQUEST_TALENT", companyName: "Zephyr Textiles", name: "Ankit Bansal", email: "ankit@zephyrtextiles.example", phone: "+91 98100 11223", hiringType: "Bulk Hiring", rolesNeeded: "40 machine operators, 4 supervisors", message: "New unit starting September, need staffing partner.", status: "NEW" },
      { kind: "REQUEST_TALENT", companyName: "Orbita Health", name: "Dr. Kavita Rao", email: "kavita@orbitahealth.example", phone: "+91 99887 66554", hiringType: "Permanent Hiring", rolesNeeded: "Radiologists (2), Lab Manager", status: "CONTACTED" },
    ],
  });

  await db.setting.create({
    data: {
      key: "site-stats",
      value: j({ candidatesPlaced: 12000, clientCompanies: 500, yearsExperience: 15, googleRating: 4.9, offerJoinRate: 91, avgShortlistDays: 4 }),
    },
  });

  console.log(`Seeded ${jobs.length} jobs, ${companies.length} companies, ${blogPosts.length} posts.`);
  console.log("Demo logins (password: Password@123): admin@talentbridge.dev / employer@talentbridge.dev / candidate@talentbridge.dev");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
