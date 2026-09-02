import { prisma } from "@/lib/prisma";

const NPWZ_PREFIX = "31711001265";
const NPWZ_START_NUMBER = 5941;
const NPWZ_COUNTER_ID = 1;

export async function generateNpwz(): Promise<string> {
  const counter = await prisma.npwzCounter.upsert({
    where: {
      id: NPWZ_COUNTER_ID,
    },
    update: {
      nextNumber: {
        increment: 1,
      },
    },
    create: {
      id: NPWZ_COUNTER_ID,
      nextNumber: NPWZ_START_NUMBER + 1,
    },
  });

  const number = counter.nextNumber - 1;

  return `${NPWZ_PREFIX}${number}`;
}