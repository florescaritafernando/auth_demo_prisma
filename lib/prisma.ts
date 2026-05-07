import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const dbUrl = process.env.DATABASE_URL;

const connectionString = !dbUrl || dbUrl.includes("sslmode") 
    ? dbUrl || ""
    : dbUrl + (dbUrl.includes("?") ? "&" : "?") + "sslmode=verify-full";

// Skip adapter initialization during build
let prisma: PrismaClient;

if (!connectionString) {
  prisma = new PrismaClient();
} else {
  // @ts-expect-error - El adapter de Neon tiene problemas de tipos con Prisma v7
  const adapter = new PrismaNeon(connectionString);
  prisma = new PrismaClient({ adapter });
}

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;