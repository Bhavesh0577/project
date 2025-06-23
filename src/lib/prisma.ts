import { PrismaClient } from '@prisma/client';
import 'server-only';

// This function ensures that Prisma is only instantiated on the server
const getPrismaClient = () => {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error);
    // Return a dummy client for error handling in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using a dummy Prisma Client that will throw errors on all operations.');
      return createDummyPrismaClient();
    }
    throw error;
  }
};

// Create a dummy client that throws errors for all operations
// This allows the app to continue running even when Prisma fails to initialize
function createDummyPrismaClient() {
  return {
    $connect: () => Promise.reject(new Error('Prisma Client failed to initialize')),
    $disconnect: () => Promise.resolve(),
    $on: () => {},
    idea: {
      create: () => Promise.reject(new Error('Prisma Client failed to initialize')),
      findMany: () => Promise.reject(new Error('Prisma Client failed to initialize')),
      findUnique: () => Promise.reject(new Error('Prisma Client failed to initialize')),
      update: () => Promise.reject(new Error('Prisma Client failed to initialize')),
      delete: () => Promise.reject(new Error('Prisma Client failed to initialize')),
    },
  } as unknown as PrismaClient;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 