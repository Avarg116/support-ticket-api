import "dotenv/config";
import { pool } from "../src/lib/db.js";
import { resetDatabase } from "./reset.js";

await resetDatabase();
await pool.end();

console.log("Database reset with sample data");
