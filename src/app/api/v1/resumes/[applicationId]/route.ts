import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { recordIncident } from "@/lib/incidents";
import { prisma } from "@/lib/prisma";
import { RESUME_MIME_BY_EXT, resumeExtFromKey, safeDownloadName } from "@/lib/resumes";
import { StorageError, openResumeStream } from "@/lib/resume-storage";

export const dynamic = "force-dynamic";

/**
 * Streams an applicant's resume to a signed-in ADMIN or STAFF user.
 * This is the only way a resume leaves storage: the R2 bucket is private.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const session = await requireRole(["ADMIN", "STAFF"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { applicationId } = await params;
  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    select: { resumeKey: true, resumeFileName: true, resumeSizeBytes: true },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ext = resumeExtFromKey(application.resumeKey);
  if (!ext) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { stream, contentLength } = await openResumeStream(application.resumeKey);
    const headers = new Headers({
      "Content-Type": RESUME_MIME_BY_EXT[ext],
      "Content-Disposition": `attachment; filename="${safeDownloadName(application.resumeFileName, ext)}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });
    const length = contentLength ?? application.resumeSizeBytes;
    if (length > 0) headers.set("Content-Length", String(length));
    return new Response(stream, { headers });
  } catch (err) {
    const e = err instanceof StorageError ? err : new StorageError("get", err);
    if (e.status === 404) return NextResponse.json({ error: "The resume file is missing from storage." }, { status: 404 });
    await recordIncident("resume.download", "A resume could not be downloaded from storage.", {
      error: e.message,
      status: e.status,
      applicationId,
    });
    return NextResponse.json({ error: "The resume could not be fetched right now. Try again shortly." }, { status: 502 });
  }
}
