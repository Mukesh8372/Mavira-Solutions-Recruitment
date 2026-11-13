import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordIncident } from "@/lib/incidents";
import { StorageError, deleteResume, listResumeObjects, storageConfigured } from "@/lib/resume-storage";
import { revalidateJobPages } from "@/features/jobs/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Files younger than this are left alone: an apply request may still be writing its row. */
const ORPHAN_MIN_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Daily housekeeping, called by the scheduler with `Authorization: Bearer <CRON_SECRET>`
 * (see vercel.json). Two jobs:
 *   1. Close PUBLISHED jobs whose apply-by date has passed.
 *   2. Delete resume files in storage that no application references and that are
 *      older than 24 hours (left behind when an apply request failed after upload).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "CRON_SECRET is not set." }, { status: 500 });
    }
  } else if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const result = { closedJobs: 0, scanned: 0, deleted: 0, errors: [] as string[] };

  // 1. Expired jobs.
  try {
    const expired = await prisma.job.updateMany({
      where: { status: "PUBLISHED", validThrough: { lte: new Date() } },
      data: { status: "CLOSED" },
    });
    result.closedJobs = expired.count;
    if (expired.count > 0) revalidateJobPages();
  } catch (err) {
    const message = err instanceof Error ? err.name : "UnknownError";
    result.errors.push(`close-expired: ${message}`);
    await recordIncident("cron.cleanup", "The cleanup job could not close expired jobs.", { error: message });
  }

  // 2. Orphaned resume files.
  if (!storageConfigured()) {
    result.errors.push("storage: not configured");
  } else {
    try {
      const cutoff = Date.now() - ORPHAN_MIN_AGE_MS;
      let cursor: string | undefined;
      do {
        const page = await listResumeObjects(cursor);
        cursor = page.nextCursor;
        const old = page.objects.filter((o) => o.lastModified !== undefined && o.lastModified.getTime() < cutoff);
        result.scanned += page.objects.length;
        if (old.length === 0) continue;
        const referenced = await prisma.jobApplication.findMany({
          where: { resumeKey: { in: old.map((o) => o.key) } },
          select: { resumeKey: true },
        });
        const keep = new Set(referenced.map((r) => r.resumeKey));
        for (const o of old) {
          if (keep.has(o.key)) continue;
          await deleteResume(o.key);
          result.deleted += 1;
        }
      } while (cursor);
    } catch (err) {
      const e = err instanceof StorageError ? err : new StorageError("list", err);
      result.errors.push(`storage: ${e.message}`);
      await recordIncident("cron.cleanup", "The cleanup job could not scan or delete resume files.", { error: e.message, status: e.status });
    }
  }

  return NextResponse.json({ ok: result.errors.length === 0, ...result, ms: Date.now() - startedAt });
}
