import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAuditLog(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      // Prisma's generated type for a nullable Json column is stricter
      // than plain `Record<string, unknown>` (it wants an explicit
      // InputJsonValue), even though the shapes are compatible at
      // runtime — this cast tells TypeScript what we already know.
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
