import { PrismaClient } from '@prisma/client';

export interface StoredProofRef {
  entityAddress: string;
  cid: string;
  type: string;
  timestamp: number;
}

const memoryStore: StoredProofRef[] = [];
const prisma = process.env['DATABASE_URL'] ? new PrismaClient() : null;

export async function saveProof(ref: Omit<StoredProofRef, 'timestamp'>): Promise<StoredProofRef> {
  const timestamp = Date.now();
  const stored = { ...ref, timestamp };
  memoryStore.push(stored);

  if (prisma) {
    await prisma.proofRecord.upsert({
      where: { cid: ref.cid },
      update: { entityAddress: ref.entityAddress, type: ref.type },
      create: {
        entityAddress: ref.entityAddress,
        cid: ref.cid,
        type: ref.type,
        timestamp: new Date(timestamp),
      },
    });
  }

  return stored;
}

export async function listProofs(entityAddress?: string): Promise<StoredProofRef[]> {
  if (prisma) {
    const rows = entityAddress
      ? await prisma.proofRecord.findMany({ where: { entityAddress }, orderBy: { timestamp: 'desc' } })
      : await prisma.proofRecord.findMany({ orderBy: { timestamp: 'desc' } });
    return rows.map((row) => ({
      entityAddress: row.entityAddress,
      cid: row.cid,
      type: row.type,
      timestamp: row.timestamp.getTime(),
    }));
  }

  return (entityAddress
    ? memoryStore.filter((proof) => proof.entityAddress === entityAddress)
    : [...memoryStore]
  ).sort((a, b) => b.timestamp - a.timestamp);
}
