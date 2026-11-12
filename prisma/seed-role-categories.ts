import { PrismaClient } from "@prisma/client";

/**
 * Upserts the role categories (Prisma model: Department) used by the job board.
 * Safe to run repeatedly: it never deletes rows and never changes an existing slug.
 *
 *   npm run seed:categories
 *
 * Icons must be names from `contentIconOptions` in src/features/site-content/schemas.ts.
 */
const db = new PrismaClient();

const categories = [
  { slug: "relationship-management", name: "Relationship Management", icon: "handshake" },
  { slug: "wealth-management", name: "Wealth Management", icon: "crown" },
  { slug: "sales-business-development", name: "Sales & Business Development", icon: "target" },
  { slug: "branch-management", name: "Branch Management", icon: "building" },
  { slug: "equity-dealing", name: "Equity Dealing", icon: "gauge" },
  { slug: "research-analysis", name: "Research & Analysis", icon: "search" },
  { slug: "operations", name: "Operations", icon: "list-checks" },
  { slug: "compliance-risk", name: "Compliance & Risk", icon: "shield-check" },
  { slug: "credit-lending", name: "Credit & Lending", icon: "wallet" },
  { slug: "customer-service", name: "Customer Service", icon: "headset" },
  { slug: "team-leadership", name: "Team Leadership", icon: "users" },
  { slug: "finance-accounts", name: "Finance & Accounts", icon: "landmark" },
  { slug: "human-resources", name: "Human Resources", icon: "user-check" },
  { slug: "technology-fintech", name: "Technology & FinTech", icon: "monitor" },
] as const;

async function main() {
  let created = 0;
  let updated = 0;
  for (const c of categories) {
    const existing = await db.department.findUnique({ where: { slug: c.slug } });
    await db.department.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, icon: c.icon },
    });
    if (existing) updated += 1;
    else created += 1;
  }
  const total = await db.department.count();
  console.log(`Role categories: ${created} created, ${updated} updated, ${total} total.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
