import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FaqManager } from "@/features/site-content/faq-manager";
import type { FaqInput } from "@/features/site-content/schemas";

export const metadata: Metadata = { title: "FAQs", robots: { index: false } };

export default async function AdminFaqsPage() {
  const faqs = await prisma.faqItem.findMany({ orderBy: [{ audience: "asc" }, { order: "asc" }] });

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Shown on the FAQ page, homepage, and the employer/candidate hubs — with FAQ schema for search engines."
      />
      <FaqManager
        faqs={faqs.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          audience: f.audience as FaqInput["audience"],
          order: f.order,
        }))}
      />
    </>
  );
}
