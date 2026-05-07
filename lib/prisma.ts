import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL!.includes("sslmode") 
    ? process.env.DATABASE_URL!
    : process.env.DATABASE_URL! + (process.env.DATABASE_URL!.includes("?") ? "&" : "?") + "sslmode=verify-full";

// @ts-expect-error - El adapter de Neon tiene problemas de tipos con Prisma v7
const adapter = new PrismaNeon(connectionString);

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;