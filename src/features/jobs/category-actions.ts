"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidateJobPages } from "@/features/jobs/cache";
import { categoryKey, categoryNameSchema } from "@/features/jobs/admin-schemas";

/**
 * Role categories (`Department` rows). ADMIN and STAFF can add, rename, delete,
 * and move a category's jobs to another category before deleting it.
 */

export type CategoryResult =
  | { ok: true; message?: string; id?: string; name?: string }
  | { ok: false; error: string; existingId?: string };

const notStaff = { ok: false, error: "You need admin or staff access for this." } as const;

function revalidateCategoryPages() {
  revalidateJobPages(); // /jobs filters, /jobs/category/*, sitemap, admin job lists
  revalidatePath("/admin/categories");
}

function parseName(input: unknown): { ok: true; name: string; slug: string } | { ok: false; error: string } {
  const parsed = categoryNameSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter a valid name" };
  const slug = slugify(parsed.data);
  if (!slug) return { ok: false, error: "The name needs at least one letter" };
  return { ok: true, name: parsed.data, slug };
}

/**
 * Another category that reads the same: letter case, spaces, punctuation and "&" vs "and"
 * are ignored ("Sales & BD" = "sales and bd"), or one with the same URL slug.
 */
async function findDuplicate(name: string, slug: string, exceptId?: string) {
  const key = categoryKey(name);
  const all = await prisma.department.findMany({ select: { id: true, name: true, slug: true } });
  return all.find((d) => d.id !== exceptId && (d.slug === slug || categoryKey(d.name) === key)) ?? null;
}

const isUniqueError = (err: unknown) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";

export async function createCategory(input: unknown): Promise<CategoryResult> {
  const session = await requireRole(["ADMIN", "STAFF"]);
  if (!session) return notStaff;
  const parsed = parseName(input);
  if (!parsed.ok) return parsed;

  const duplicate = await findDuplicate(parsed.name, parsed.slug);
  if (duplicate) {
    return { ok: false, error: `"${duplicate.name}" already exists. Use it instead.`, existingId: duplicate.id };
  }

  try {
    const created = await prisma.department.create({ data: { name: parsed.name, slug: parsed.slug } });
    await audit(session.user.id, "category.create", "Department", created.id, { name: created.name });
    revalidateCategoryPages();
    return { ok: true, message: "Category added", id: created.id, name: created.name };
  } catch (err) {
    if (isUniqueError(err)) return { ok: false, error: "A category with this name was just added. Reload the page." };
    throw err;
  }
}

export async function renameCategory(id: string, input: unknown): Promise<CategoryResult> {
  const session = await requireRole(["ADMIN", "STAFF"]);
  if (!session) return notStaff;
  const parsed = parseName(input);
  if (!parsed.ok) return parsed;

  const existing = await prisma.department.findUnique({ where: { id }, include: { _count: { select: { jobs: true } } } });
  if (!existing) return { ok: false, error: "Category not found." };
  if (existing.name === parsed.name) return { ok: true, message: "No change" };

  // The URL follows the name only while no job uses the category. After that it stays
  // fixed so that links already shared or indexed keep working.
  const slug = existing._count.jobs === 0 ? parsed.slug : existing.slug;
  const duplicate = await findDuplicate(parsed.name, slug, id);
  if (duplicate) return { ok: false, error: `"${duplicate.name}" already exists.` };

  try {
    await prisma.department.update({ where: { id }, data: { name: parsed.name, slug } });
  } catch (err) {
    if (isUniqueError(err)) return { ok: false, error: "Another category already uses this name." };
    throw err;
  }
  await audit(session.user.id, "category.rename", "Department", id, {
    from: { name: existing.name, slug: existing.slug },
    to: { name: parsed.name, slug },
  });
  revalidateCategoryPages();
  return { ok: true, message: "Category renamed" };
}

export async function deleteCategory(id: string): Promise<CategoryResult> {
  const session = await requireRole(["ADMIN", "STAFF"]);
  if (!session) return notStaff;
  const existing = await prisma.department.findUnique({ where: { id }, include: { _count: { select: { jobs: true } } } });
  if (!existing) return { ok: false, error: "Category not found." };
  // Counts jobs in every status. The database also blocks this delete (ON DELETE RESTRICT).
  if (existing._count.jobs > 0) {
    const n = existing._count.jobs;
    return { ok: false, error: `"${existing.name}" has ${n} job${n === 1 ? "" : "s"}. Move them to another category first.` };
  }
  await prisma.department.delete({ where: { id } });
  await audit(session.user.id, "category.delete", "Department", id, { name: existing.name, slug: existing.slug });
  revalidateCategoryPages();
  return { ok: true, message: "Category deleted" };
}

/** Moves every job (any status) to `targetId`, then deletes the category. One transaction. */
export async function moveCategoryJobsAndDelete(id: string, targetId: string): Promise<CategoryResult> {
  const session = await requireRole(["ADMIN", "STAFF"]);
  if (!session) return notStaff;
  if (!targetId) return { ok: false, error: "Choose the category to move the jobs to." };
  if (targetId === id) return { ok: false, error: "Choose a different category." };

  const [source, target] = await Promise.all([
    prisma.department.findUnique({ where: { id }, select: { id: true, name: true, slug: true } }),
    prisma.department.findUnique({ where: { id: targetId }, select: { id: true, name: true } }),
  ]);
  if (!source) return { ok: false, error: "Category not found." };
  if (!target) return { ok: false, error: "The category to move the jobs to no longer exists." };

  const moved = await prisma.$transaction(async (tx) => {
    const { count } = await tx.job.updateMany({ where: { departmentId: id }, data: { departmentId: targetId } });
    await tx.department.delete({ where: { id } });
    return count;
  });
  await audit(session.user.id, "category.merge", "Department", id, {
    from: { name: source.name, slug: source.slug },
    to: { id: target.id, name: target.name },
    jobsMoved: moved,
  });
  revalidateCategoryPages();
  return { ok: true, message: `Moved ${moved} job${moved === 1 ? "" : "s"} to "${target.name}" and deleted "${source.name}"` };
}
