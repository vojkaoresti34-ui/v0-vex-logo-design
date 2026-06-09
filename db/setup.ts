import "./env";
import fs from "fs";
import path from "path";
import { db, prisma } from "../lib/db";

async function main() {
  console.log("🛠️ Starting database schema application...");

  const schemaPath = path.join(__dirname, "schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ schema.sql not found at ${schemaPath}`);
    process.exit(1);
  }

  console.log(`📖 Reading schema file from: ${schemaPath}`);
  const sql = fs.readFileSync(schemaPath, "utf-8");

  try {
    console.log("⚡ Executing schema.sql statements on target PostgreSQL...");
    // pg.Pool.query can execute multiple DDL statements sequentially when no parameters are provided
    await db.query(sql);
    console.log("✅ Database schema applied successfully!");
  } catch (error) {
    console.error("❌ Failed to apply database schema:", error);
    process.exit(1);
  } finally {
    console.log("🔌 Closing database connection pool...");
    await prisma.$disconnect();
  }
}

main();
