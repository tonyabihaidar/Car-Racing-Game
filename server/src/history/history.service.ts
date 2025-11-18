import { prisma } from '../core/db';

export async function saveEncryption(
  userId: string,
  data: {
    algorithm: string;
    mode?: string;
    plaintext: string;
    ciphertext: string;
    keyUsed: string;
    blockCount?: number;
  }
) {
  // Truncate plaintext if too long (store max 1000 chars)
  const truncatedPlaintext = data.plaintext.length > 1000 
    ? data.plaintext.substring(0, 1000) + '...' 
    : data.plaintext;

  // Mask key - show first 8 chars + ***
  const maskedKey = data.keyUsed.substring(0, 8) + '***';

  return await prisma.encryptionHistory.create({
    data: {
      userId,
      algorithm: data.algorithm,
      mode: data.mode || null,
      plaintext: truncatedPlaintext,
      ciphertext: data.ciphertext,
      keyUsed: maskedKey,
      blockCount: data.blockCount || 1,
    },
  });
}

export async function getUserHistory(userId: string, limit: number = 50) {
  return await prisma.encryptionHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function deleteHistoryItem(userId: string, historyId: string) {
  // Verify ownership before deleting
  const item = await prisma.encryptionHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!item) {
    throw new Error('History item not found or unauthorized');
  }

  await prisma.encryptionHistory.delete({
    where: { id: historyId },
  });

  return { success: true };
}

export async function deleteAllHistory(userId: string) {
  await prisma.encryptionHistory.deleteMany({
    where: { userId },
  });

  return { success: true };
}