"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidateJobPages } from "@/features/jobs/cache";
import {
  achievementsSchema,
  announcementSchema,
  contactSchema,
  contentKeys,
  faqSchema,
  heroSchema,
  industrySchema,
  logosSchema,
  processSchema,
  statsSchema,
  successStorySchema,
  teamSchema,
  whyUsSchema,
} from "@/features/site-content/schemas";

export type ContentActionResult = { ok: true; message?: string; id?: string; name?: string } | { ok: false; error: string };

async function requireStaff() {
  return requireRole(["ADMIN", "STAFF"]);
}

async function audit(actorId: string, action: string, entity: string, entityId: string, diff?: unknown) {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, diff: diff === undefined ? undefined : JSON.stringify(diff) },
  });
}

/** Pages that render each content block — revalidated together after a save. */
const contentPaths = ["/", "/employers", "/process", "/why-choose-us", "/about", "/faq"];

function revalidateContentPages() {
  for (const path of contentPaths) revalidatePath(path);
  revalidatePath("/services/[slug]", "page");
}

async function saveSetting(
  key: string,
  value: unknown,
  schema: z.ZodTypeAny,
  actorLabel: string
): Promise<ContentActionResult> {
  const session = await requireStaff();
  if (!session) return { ok: false, error: "You don't have permission to edit site content." };

  const parsed = schema.safeParse(value);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid content" };

  await prisma.setting.upsert({
    where: { key },
    create: { key, value: JSON.stringify(parsed.data) },
    update: { value: JSON.stringify(parsed.data) },
  });
  await audit(session.user.id, `content.${actorLabel}.save`, "Setting", key);
  revalidateContentPages();
  return { ok: true, message: "Saved — the site is updated." };
}

export async function saveHeroContent(input: unknown) {
  return saveSetting(contentKeys.hero, input, heroSchema, "hero");
}
export async function saveStatsContent(input: unknown) {
  return saveSetting(contentKeys.stats, input, statsSchema, "stats");
}
export async function saveLogosContent(input: unknown) {
  return saveSetting(contentKeys.logos, input, logosSchema, "logos");
}
export async function saveProcessContent(input: unknown) {
  return saveSetting(contentKeys.process, input, processSchema, "process");
}
export async function saveWhyUsContent(input: unknown) {
  return saveSetting(contentKeys.whyUs, input, whyUsSchema, "why-us");
}
export async function saveAchievements(input: unknown) {
  return saveSetting(contentKeys.achievements, input, achievementsSchema, "achievements");
}
export async function saveTeam(input: unknown) {
  return saveSetting(contentKeys.team, input, teamSchema, "team");
}

/** Contact details appear in the header/footer of every page — revalidate the whole tree. */
export async function saveContactContent(input: unknown): Promise<ContentActionResult> {
  const session = await requireStaff();
  if (!session) return { ok: false, error: "You don't have permission to edit site content." };
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid content" };
  await prisma.setting.upsert({
    where: { key: contentKeys.contact },
    create: { key: contentKeys.contact, value: JSON.stringify(parsed.data) },
    update: { value: JSON.stringify(parsed.data) },
  });
  await audit(session.user.id, "content.contact.save", "Setting", contentKeys.contact);
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved — contact details updated across the site." };
}

/** The announcement bar renders above the header on every public page. */
export async function saveAnnouncement(input: unknown): Promise<ContentActionResult> {
  const session = await requireStaff();
  if (!session) return { ok: false, error: "You don't have permission to edit site content." };
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid content" };
  await prisma.setting.upsert({
    where: { key: contentKeys.announcement },
    create: { key: contentKeys.announcement, value: JSON.stringify(parsed.data) },
    update: { value: JSON.stringify(parsed.data) },
  });
  await audit(session.user.id, "content.announcement.save", "Setting", contentKeys.announcement);
  revalidatePath("/", "layout");
  return { ok: true, message: parsed.data.enabled ? "Announcement is live." : "Announcement saved (hidden)." };
}

/* ---------------- FAQ CRUD ---------------- */

export async function saveFaq(input: unknown, id?: string): Promise<ContentActionResult> {
  const session = await requireStaff();
  if (!session) return { ok: false, error: "You don't have permission to edit FAQs." };

  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid FAQ" };

  if (id) {
    const existing = await prisma.faqItem.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "FAQ not found." };
    await prisma.faqItem.update({ where: { id }, data: parsed.data });
    await audit(session.user.id, "content.faq.update", "FaqItem", id);
  } else {
    const created = await prisma.faqItem.create({ data: parsed.data });
    await audit(session.user.id, "content.faq.create", "FaqItem", created.id);
  }
  revalidateContentPages();
  return { ok: true, message: id ? "FAQ updated" : "FAQ added" };
}

export async function deleteFaq(id: string): Promise<ContentActionResult> {
  const session = await requireStaff();
  if (!session) return { ok: false, error: "You don't have permission to edit FAQs." };
  const existing = await prisma.faqItem.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "FAQ not found." };
  await prisma.faqItem.delete({ where: { id } });
  await audit(session.user.id, "content.faq.delete", "FaqItem", id, { question: existing.question });
  revalidateContentPages();
  return { ok: true, message: "FAQ deleted" };
}

/* ---------------- Industry CRUD ---------------- */

/**
 * The footer lists industries on every public page, so revalidate the whole
 * layout tree. The sitemap is a route handler, so it is named on its own.
 */
function revalidateIndustryPages() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

export async function saveIndustry(input: unknown, id?: string): Promise<ContentActionResult> {
  const session = await requireStaff();
  if (!session) return { ok: false, error: "You don't have permission to edit industries." };

  const parsed = industrySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid industry" };

  if (id) {
    const existing = await prisma.industry.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "Industry not found." };
    const sameName = await prisma.industry.findFirst({
      where: { name: { equals: parsed.data.name, mode: "insensitive" }, NOT: { id } },
      select: { name: true },
    });
    if (sameName) return { ok: false, error: `"${sameName.name}" already exists.` };
    // Slug stays stable on rename so indexed landing-page URLs never break.
    await prisma.industry.update({ where: { id }, data: parsed.data });
    await audit(session.user.id, "content.industry.update", "Industry", id);
    revalidateIndustryPages();
    return { ok: true, message: "Industry updated", id, name: parsed.data.name };
  }

  const slug = slugify(parsed.data.name);
  if (!slug) return { ok: false, error: "The name needs at least one letter." };
  const clash = await prisma.industry.findFirst({
    where: { OR: [{ slug }, { name: { equals: parsed.data.name, mode: "insensitive" } }] },
    select: { name: true },
  });
  if (clash) return { ok: false, error: `"${clash.name}" already exists.` };
  const created = await prisma.industry.create({ data: { ...parsed.data, slug } });
  await audit(session.user.id, "content.industry.create", "Industry", created.id);
  revalidateIndustryPages();
  return { ok: true, message: "Industry added", id: created.id, name: created.name };
}

/* ---------------- Success stories CRUD ---------------- */

function revalidateStoryPages() {
  revalidatePath("/success-stories");
  revalidatePath("/success-stories/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

export async function saveSuccessStory(input: unknown, id?: string): Promise<ContentActionResult> {
  const session = await requireStaff();
  if (!session) return { ok: false, error: "You don't have permission to edit success stories." };

  const parsed = successStorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid story" };

  const data = {
    title: parsed.data.title,
    clientName: parsed.data.clientName,
    industry: parsed.data.industry,
    challenge: parsed.data.challenge,
    solution: parsed.data.solution,
    results: JSON.stringify(parsed.data.results),
    metrics: JSON.stringify(parsed.data.metrics),
    status: parsed.data.status,
  };

  if (id) {
    const existing = await prisma.successStory.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "Story not found." };
    // Slug stays stable on edit so shared links keep working.
    await prisma.successStory.update({ where: { id }, data });
    await audit(session.user.id, "content.story.update", "SuccessStory", id);
  } else {
    let slug = slugify(parsed.data.title);
    if (await prisma.successStory.findUnique({ where: { slug } })) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }
    const created = await prisma.successStory.create({ data: { ...data, slug } });
    await audit(session.user.id, "content.story.create", "SuccessStory", created.id);
  }
  revalidateStoryPages();
  return { ok: true, message: id ? "Story updated" : "Story added" };
}

export async function deleteSuccessStory(id: string): Promise<ContentActionResult> {
  const session = await requireStaff();
  if (!session) return { ok: false, error: "You don't have permission to edit success stories." };
  const existing = await prisma.successStory.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Story not found." };
  await prisma.successStory.delete({ where: { id } });
  await audit(session.user.id, "content.story.delete", "SuccessStory", id, { title: existing.title });
  revalidateStoryPages();
  return { ok: true, message: "Story deleted" };
}

export async function deleteIndustry(id: string): Promise<ContentActionResult> {
  const session = await requireStaff();
  if (!session) return { ok: false, error: "You don't have permission to edit industries." };
  const existing = await prisma.industry.findUnique({
    where: { id },
    include: { _count: { select: { jobs: true } } },
  });
  if (!existing) return { ok: false, error: "Industry not found." };
  if (existing._count.jobs > 0) {
    return { ok: false, error: `"${existing.name}" has ${existing._count.jobs} job(s) attached — reassign them first.` };
  }
  await prisma.industry.delete({ where: { id } });
  await audit(session.user.id, "content.industry.delete", "Industry", id, { name: existing.name });
  revalidateIndustryPages();
  return { ok: true, message: "Industry deleted" };
}

/**
 * Moves every job (any status) of an industry to `targetId`, or to no industry when
 * `targetId` is empty, then deletes the industry. One transaction.
 */
export async function moveIndustryJobsAndDelete(id: string, targetId: string): Promise<ContentActionResult> {
  const session = await requireStaff();
  if (!session) return { ok: false, error: "You don't have permission to edit industries." };
  if (targetId === id) return { ok: false, error: "Choose a different industry." };

  const [source, target] = await Promise.all([
    prisma.industry.findUnique({ where: { id }, select: { id: true, name: true, slug: true } }),
    targetId ? prisma.industry.findUnique({ where: { id: targetId }, select: { id: true, name: true } }) : null,
  ]);
  if (!source) return { ok: false, error: "Industry not found." };
  if (targetId && !target) return { ok: false, error: "The industry to move the jobs to no longer exists." };

  const moved = await prisma.$transaction(async (tx) => {
    const { count } = await tx.job.updateMany({ where: { industryId: id }, data: { industryId: target?.id ?? null } });
    await tx.industry.delete({ where: { id } });
    return count;
  });
  await audit(session.user.id, "content.industry.merge", "Industry", id, {
    from: { name: source.name, slug: source.slug },
    to: target ? { id: target.id, name: target.name } : null,
    jobsMoved: moved,
  });
  revalidateIndustryPages();
  revalidateJobPages();
  const where = target ? `to "${target.name}"` : "to no industry";
  return { ok: true, message: `Moved ${moved} job${moved === 1 ? "" : "s"} ${where} and deleted "${source.name}"` };
}
