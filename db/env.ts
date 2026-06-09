import fs from "fs";
import path from "path";

// Load .env files manually if running in Node.js environment (for CLI scripts)
if (typeof window === "undefined") {
  try {
    const envFiles = [".env.local", ".env"];
    for (const file of envFiles) {
      const envPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const firstEqual = trimmed.indexOf("=");
            if (firstEqual > 0) {
              const key = trimmed.slice(0, firstEqual).trim();
              let value = trimmed.slice(firstEqual + 1).trim();
              if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
              } else if (value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1);
              }
              // Set the environment variable if not already set by system
              if (!process.env[key]) {
                process.env[key] = value;
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("⚠️ Failed to load env variables manually:", e);
  }
}
