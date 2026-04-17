import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, type PoolConfig } from "pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "POSTGRES_URL_NON_POOLING, POSTGRES_URL, POSTGRES_PRISMA_URL ou DATABASE_URL precisam estar definidos."
    );
  }

  const adapter = new PrismaPg(createPool(connectionString));
  return new PrismaClient({ adapter });
}

function createPool(connectionString: string) {
  const connectionUrl = new URL(connectionString);
  const sslMode = connectionUrl.searchParams.get("sslmode");
  const poolConfig: PoolConfig = { connectionString };

  if (sslMode !== "disable") {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  return new Pool(poolConfig);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
