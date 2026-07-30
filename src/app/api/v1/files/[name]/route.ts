import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/uploads";

const contentTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/** Serves uploaded resumes to authorized users only (owner, admin/staff, or hiring employer). */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filePath = resolveUploadPath(name);
  if (!filePath) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const resume = await prisma.resume.findFirst({
    where: { fileUrl: `/api/v1/files/${name}` },
    include: { candidate: true, applications: { include: { job: true } } },
  });
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { role, id: userId } = session.user;
  const isOwner = resume.candidate.userId === userId;
  const isStaff = role === "ADMIN" || role === "STAFF";
  const isHiringEmployer =
    role === "EMPLOYER" &&
    (await prisma.employerProfile
      .findUnique({ where: { userId } })
      .then((p) => (p ? resume.applications.some((a) => a.job.companyId === p.companyId) : false)));

  if (!isOwner && !isStaff && !isHiringEmployer) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await readFile(filePath);
    const ext = name.slice(name.lastIndexOf("."));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypes[ext] ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${resume.fileName.replace(/[^\w.\- ]/g, "_")}"`,
        "Cache-Control": "private, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
