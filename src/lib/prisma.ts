import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from '../../prisma/schema.d';
import contractJson from '../../prisma/schema.json' with { type: 'json' };

// @ts-ignore - temporary workaround for contract type mismatch
export const prisma = postgres<Contract>({
  contractJson,
  url: process.env.DATABASE_URL!,
});
