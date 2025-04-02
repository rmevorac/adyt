import { PrismaClient } from '@prisma/client';
import { mockPrismaClient } from './prisma-mock';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use mock client in production for now (until database is set up)
const USE_MOCK_IN_PRODUCTION = true;

export const prisma = globalForPrisma.prisma ?? 
  (process.env.NODE_ENV === 'production' && USE_MOCK_IN_PRODUCTION
    ? mockPrismaClient as unknown as PrismaClient
    : new PrismaClient());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} 