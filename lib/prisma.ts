import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Limpiamos la URL para evitar errores de parsing en Linux
const connectionString = process.env.DATABASE_URL!;

// 2. Creamos un Pool de conexiones (forma recomendada para el adaptador)
const pool = new Pool({
  connectionString,
  // Forzamos SSL pero de forma más flexible para la VPS
  ssl: connectionString.includes("sslmode=disable") ? false : { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

// En producción no es necesario llamar a $connect() manualmente aquí, 
// Prisma lo hace en la primera consulta.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;