import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as PrismaPkg from "@prisma/client";
const { PrismaClient } = PrismaPkg as any;

const globalForPrisma = global as any;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
