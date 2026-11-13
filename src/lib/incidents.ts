import "server-only";

import { prisma } from "@/lib/prisma";

export type IncidentKind = "resume.upload" | "resume.download" | "resume.delete" | "cron.cleanup";

/**
 * Records an operational failure that happened with no signed-in user (so it cannot go
 * in AuditLog). The /admin overview shows open incidents as a banner until resolved.
 *
 * Never throws: a failure to record is logged with console.error instead.
 * `message` must not contain applicant personal data.
 */
export async function recordIncident(
  kind: IncidentKind,
  message: string,
  detail?: Record<string, string | number | undefined>
): Promise<void> {
  try {
    await prisma.systemIncident.create({
      data: { kind, message, detail: detail === undefined ? undefined : JSON.stringify(detail) },
    });
  } catch (err) {
    console.error("[incident] could not record", kind, message, err);
  }
}
