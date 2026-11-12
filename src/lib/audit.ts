import "server-only";

import { prisma } from "@/lib/prisma";

/** Writes one AuditLog row for an admin mutation. `diff` must not hold applicant personal data. */
export async function audit(actorId: string, action: string, entity: string, entityId: string, diff?: unknown) {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, diff: diff === undefined ? undefined : JSON.stringify(diff) },
  });
}
