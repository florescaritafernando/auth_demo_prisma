import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

function getConnectionString(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return "";
  
  if (dbUrl.includes("sslmode")) return dbUrl;
  return dbUrl + (dbUrl.includes("?") ? "&" : "?") + "sslmode=verify-full";
}

let prismaInstance: PrismaClient | undefined;

function createPrismaClient(): PrismaClient {
  const connectionString = getConnectionString();
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // @ts-expect-error - El adapter de Neon tiene problemas de tipos con Prisma v7
  const adapter = new PrismaNeon(connectionString);
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
  };

  if (process.env.NODE_ENV === "production") {
    if (!prismaInstance) {
      prismaInstance = createPrismaClient();
    }
    return prismaInstance;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});

export default prisma;