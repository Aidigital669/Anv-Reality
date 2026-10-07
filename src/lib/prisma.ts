import 'temporal-polyfill/full/global';
import postgres from '@prisma/orm-postgres/runtime';
import contractJson from '../../prisma/schema.json' with { type: 'json' };

// Global singleton to prevent connection pool exhaustion in development HMR
const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma: any =
  globalForPrisma.prisma ??
  (postgres as any)({
    contractJson,
    url: process.env.DATABASE_URL!,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

