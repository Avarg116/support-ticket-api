import "dotenv/config";
import { readFile } from "node:fs/promises";
import { pool } from "../src/lib/db.js";

const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
const seed = await readFile(new URL("./seed.sql", import.meta.url), "utf8");

await pool.query(schema);
await pool.query(seed);
await pool.end();

console.log("Database reset with sample data");
