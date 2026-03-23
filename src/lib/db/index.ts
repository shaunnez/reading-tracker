import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

export function getDb(): Db {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local and restart the dev server.");
  }
  return drizzle(neon(process.env.DATABASE_URL), { schema });
}
