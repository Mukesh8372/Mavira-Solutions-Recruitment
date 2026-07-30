import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Local-disk upload adapter for development.
 * Production: replace with S3/UploadThing presigned uploads behind the same signature.
 * Files land outside /public and are served through the authenticated
 * /api/v1/files route so resumes are never world-readable.
 */
const uploadRoot = path.join(process.cwd(), "uploads");

const extByMime: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

export async function saveUploadedResume(file: File): Promise<{ url: string; storedName: string }> {
  await mkdir(uploadRoot, { recursive: true });
  const ext = extByMime[file.type] ?? ".bin";
  const storedName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadRoot, storedName), buffer);
  return { url: `/api/v1/files/${storedName}`, storedName };
}

export function resolveUploadPath(storedName: string): string | null {
  // Prevent path traversal — stored names are hex + known extension only.
  if (!/^[a-f0-9]{32}\.(pdf|doc|docx|bin)$/.test(storedName)) return null;
  return path.join(uploadRoot, storedName);
}
