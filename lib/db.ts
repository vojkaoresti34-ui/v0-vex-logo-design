import { PrismaClient } from "@prisma/client";
import { QueryResultRow, Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Temporary compatibility shim while migrating to Prisma ORM.
// This allows legacy files to still call `db.query` and `db.transaction`
export const db = {
  ...prisma,
  async query<T extends QueryResultRow = any>(
    text: string,
    params: any[] = []
  ): Promise<{ rows: T[]; rowCount: number }> {
    // We convert the parameterized query to Prisma's queryRawUnsafe
    // Note: This is an unsafe conversion and should be migrated.
    let prismaText = text;
    // Replace $1, $2 with Prisma's parameters or just pass it to Prisma
    // Prisma $queryRawUnsafe supports $1, $2 in postgres natively.
    try {
      const rows = await prisma.$queryRawUnsafe<T[]>(prismaText, ...params);
      return { rows: rows || [], rowCount: (rows || []).length };
    } catch (err) {
      console.error("[SHIM SQL_ERROR]", { text, err });
      throw err;
    }
  },
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    // This is a naive shim. It doesn't actually wrap in a PG transaction block
    // but Prisma handles transactions via `$transaction`.
    // Since we pass a dummy 'client' object that implements `query`, it will work.
    return callback(this);
  }
};
