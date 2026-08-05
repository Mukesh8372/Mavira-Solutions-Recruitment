import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const db = new PrismaClient();

const j = (v: unknown) => JSON.stringify(v) as unknown as string;

/** The four sectors from the Mavira Solutions company profile. */
const industries = [
  { name: "Banking & Financial Services", slug: "banking-financial-services", icon: "landmark", description: "Retail and corporate banking, lending and payments talent." },
  { name: "Insurance & Wealth Management", slug: "insurance-wealth-management", icon: "shield-check", description: "Insurance, wealth and investment advisory professionals." },
  { name: "Stock Broking & Equity", slug: "stock-broking-equity", icon: "briefcase-business", description: "Equity dealers, research analysts and broking leadership." },
  { name: "NBFC & FinTech", slug: "nbfc-fintech", icon: "wallet", description: "NBFC lending teams and high-growth FinTech talent." },
];

/**
 * Sample testimonials and success stories are seeded UNPUBLISHED so nothing
 * fabricated appears on the live site — approve or replace them in the admin.
 */
const testimonials = [
  { authorName: "Head of HR", authorRole: "HR Leader", company: "A private bank", quote: "Sample testimonial — replace with a real client quote from the admin panel before approving.", kind: "CLIENT", featured: false },
  { authorName: "Branch Manager", authorRole: "Placed candidate", company: "A broking firm", quote: "Sample candidate testimonial — replace with a real quote from the admin panel before approving.", kind: "CANDIDATE", featured: false },
];

const stories = [
  {
    slug: "sample-branch-build-out",
    title: "Sample: staffing a new broking branch end to end",
    clientName: "Sample Client",
    industry: "Broking",
    challenge: "This is a sample success story kept in draft. Replace the challenge, solution and results with a real engagement before publishing.",
    solution: "Describe how Mavira Solutions ran the search — intake, screening, client interviews, offers and onboarding.",
    results: ["Replace with real, verifiable results"],
    metrics: [{ label: "Roles closed", value: "—" }],
    status: "DRAFT" as const,
  },
];

const blogPosts = [
  {
    slug: "hiring-relationship-managers-bfsi",
    title: "What to screen for when hiring Relationship Managers in BFSI",
    category: "hiring-insights", tags: ["bfsi", "hiring"], readMinutes: 6,
    excerpt: "Book size, product breadth, portability — the three questions that separate a strong RM profile from a well-written one.",
    content: "## The resume tells you products; the interview tells you the book\n\nRelationship Manager resumes in banking, wealth and broking look remarkably similar. The differences that predict performance rarely appear on paper.\n\n### Ask about the book, not the targets\nEvery RM lists targets achieved. Ask instead: how much of your current book did you originate yourself? A self-built book signals prospecting ability; an inherited book signals account management. Both are valuable — but for different roles.\n\n### Product breadth vs product depth\nA CASA-focused banker moving to wealth needs investment-product depth they may not have. Map the role's revenue mix to the candidate's actual selling history, line by line.\n\n### Portability is a claim — test it\nCandidates often promise their clients will follow. Discount this heavily unless the relationship is genuinely personal, the products are portable, and no non-solicit stands in the way.\n\n### Certifications are the floor, not the ceiling\nIRDAI, AMFI and NISM certifications are table stakes for regulated products. Verify them during screening — expired certifications delay joining by weeks.\n\nA specialist recruiter asks these questions before you ever see the profile. That's the entire argument for domain-native screening.",
  },
  {
    slug: "equity-dealer-hiring-guide",
    title: "Hiring equity dealers: a practical screening guide",
    category: "hiring-insights", tags: ["broking", "hiring"], readMinutes: 5,
    excerpt: "NISM certifications, terminal experience, compliance history — what actually matters when staffing a dealing desk.",
    content: "## The dealing desk is a licensed seat\n\nHiring an equity dealer isn't like hiring a salesperson. The role sits inside a regulatory perimeter, and screening has to respect that.\n\n### Verify NISM first\nNISM Series VIII (Equity Derivatives) and related certifications are mandatory for dealing roles. Check validity dates — renewals take time and an expired certificate delays onboarding.\n\n### Terminal time beats years of experience\nFive years 'in broking' can mean five years of back-office work. Ask specifically: which terminals (ODIN, NEST, Greek), what order volumes, which segments — cash, F&O, commodities?\n\n### Compliance history is non-negotiable\nAsk about client-code modifications, error trades and how they were reported. A candidate who discusses errors transparently is safer than one who claims to have never made any.\n\n### Client handling under pressure\nDealers talk to clients on the worst market days. Role-play a falling-market call in the interview — composure is screenable.\n\nStructured screening against these four axes is how a shortlist earns the name.",
  },
];

const faqs = [
  { question: "What does it cost to hire through Mavira Solutions?", answer: "We work on a success-fee model — you pay only when a candidate joins, as a percentage of annual CTC that varies by role seniority and volume. There are no upfront or retainer fees for standard hiring; executive search is scoped individually. Contact us for an exact quote.", audience: "EMPLOYER", order: 1 },
  { question: "How fast can you share candidates?", answer: "Quality recruitment with quick turnaround is our core strength. After a structured intake call we commit to an honest timeline for your specific role and market — and we respond to every new brief within one business day.", audience: "EMPLOYER", order: 2 },
  { question: "Do you offer a replacement guarantee?", answer: "Yes. Permanent placements carry a free-replacement guarantee if the candidate exits within the agreed period. Terms are stated clearly in our engagement letter.", audience: "EMPLOYER", order: 3 },
  { question: "Which roles and sectors do you specialise in?", answer: "We specialise in BFSI and Broking — banking & financial services, insurance & wealth management, stock broking & equity, and NBFC & FinTech. Key roles include Relationship Managers, Wealth Managers, Sales & Branch Managers, Equity Dealers, Research Analysts, Operations Executives, Compliance Officers and Team Leaders.", audience: "EMPLOYER", order: 4 },
  { question: "Is your service free for job seekers?", answer: "Completely. We never charge candidates at any stage — no registration fees, no 'processing' charges, no deductions from your salary. Our fees come from employers. Anyone demanding money in our name is committing fraud; please report it to us immediately.", audience: "CANDIDATE", order: 5 },
  { question: "How do I share my profile with you?", answer: "Send your resume through the contact page or email it to us directly. If your profile matches a live mandate, a recruiter will call you; otherwise we keep you in our talent pool for future roles in your sector.", audience: "CANDIDATE", order: 6 },
  { question: "Where are you located, and which cities do you cover?", answer: "Our registered office is in Thane (West), Maharashtra, and we recruit pan-India for clients across metros and tier-2 cities.", audience: "GENERAL", order: 7 },
  { question: "What makes Mavira Solutions different from other agencies?", answer: "Deep BFSI, broking and FinTech specialisation; a structured 8-step methodology where every candidate is screened, pre-filtered and interviewed before reaching a client; and complete confidentiality with a client-focused, professional approach at every step.", audience: "GENERAL", order: 8 },
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

  for (const i of industries) await db.industry.create({ data: i });

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@mavira.dev";
  const adminPassword = process.env.ADMIN_PASSWORD || "Password@123";
  if (!process.env.ADMIN_PASSWORD) {
    console.warn("ADMIN_PASSWORD not set in .env — seeding admin with the default dev password.");
  }
  const admin = await db.user.create({
    data: { email: adminEmail, name: "Mukesh", role: "ADMIN", passwordHash: hashSync(adminPassword, 12), emailVerified: new Date() },
  });

  const now = Date.now();
  const day = 86_400_000;

  for (const t of testimonials) await db.testimonial.create({ data: { ...t, approved: false } });
  for (const s of stories) await db.successStory.create({ data: { ...s, results: j(s.results), metrics: j(s.metrics) } });
  for (let i = 0; i < blogPosts.length; i++) {
    const p = blogPosts[i];
    await db.blogPost.create({
      data: { ...p, tags: j(p.tags), authorId: admin.id, status: "PUBLISHED", publishedAt: new Date(now - i * 9 * day) },
    });
  }
  for (const f of faqs) await db.faqItem.create({ data: f });

  console.log(`Seeded ${industries.length} industries, ${blogPosts.length} posts, ${faqs.length} FAQs.`);
  console.log(`Admin login: ${adminEmail} (password from ADMIN_PASSWORD in .env)`);
  console.log("Sample testimonials/success stories are unapproved/draft — replace them in the admin before publishing.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
