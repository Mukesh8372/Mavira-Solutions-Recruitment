import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { jsonArray, jsonValue } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { SuccessStoriesManager } from "@/features/site-content/success-stories-manager";
import type { SuccessStoryInput } from "@/features/site-content/schemas";

export const metadata: Metadata = { title: "Success stories", robots: { index: false } };

export default async function AdminSuccessStoriesPage() {
  const stories = await prisma.successStory.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader
        title="Success stories"
        description="Case studies shown at /success-stories. Drafts stay hidden until published."
      />
      <SuccessStoriesManager
        stories={stories.map((s) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          clientName: s.clientName,
          industry: s.industry,
          challenge: s.challenge,
          solution: s.solution,
          results: jsonArray(s.results),
          metrics: jsonValue<{ label: string; value: string }[]>(s.metrics, []),
          status: s.status as SuccessStoryInput["status"],
        }))}
      />
    </>
  );
}
