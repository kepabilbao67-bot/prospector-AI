import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Turso (libSQL) en produccion si esta configurado.
  // Requiere previewFeatures = ["driverAdapters"] en schema.prisma y que
  // @prisma/adapter-libsql tenga la misma version que @prisma/client.
  if (process.env.TURSO_DATABASE_URL) {
    try {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const { createClient } = require("@libsql/client");
      const { PrismaLibSQL } = require("@prisma/adapter-libsql");
      /* eslint-enable @typescript-eslint/no-require-imports */
      const libsql = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || undefined,
      });
      return new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
    } catch (error) {
      // Antes este fallo se ignoraba en silencio y se usaba la BD local.
      console.error("[prisma] No se pudo usar Turso; se usa DATABASE_URL:", error);
    }
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
