import { PrismaClient } from '@prisma/client'
import { mockPrismaClient } from './prisma-mock'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Use mock client in production for now (until database is set up)
const USE_MOCK_IN_PRODUCTION = true;

export const prisma =
  globalForPrisma.prisma ||
  (process.env.NODE_ENV === 'production' && USE_MOCK_IN_PRODUCTION
    ? mockPrismaClient as unknown as PrismaClient 
    : new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      }))

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma 