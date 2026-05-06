import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!.includes("sslmode") 
    ? process.env.DATABASE_URL!
    : process.env.DATABASE_URL! + (process.env.DATABASE_URL!.includes("?") ? "&" : "?") + "sslmode=verify-full";

const adapter = new PrismaPg({
    connectionString,
});

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
    });

// Ensure all models are loaded
prisma.$connect().catch(console.error);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;