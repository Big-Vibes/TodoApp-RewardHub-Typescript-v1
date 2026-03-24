import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from './env.js';

// Prisma v7 JS engine requires an adapter; without this, startup throws:
// "Using engine type \"client\" requires either \"adapter\" or \"accelerateUrl\"".

const pool = new Pool({
  connectionString: config.database.url,
});

const adapter = new PrismaPg(pool);

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient({
    adapter,
    log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
};

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton(); // This prevents connection leaks caused by hot reloading.

if (config.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
  await pool.end();
};

export default prisma;
