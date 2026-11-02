import "dotenv/config";
import { readFile } from "node:fs/promises";
import { pool } from "../src/lib/db.js";

const sql = await readFile(new URL("./schema.sql", import.meta.url), "utf8");

await pool.query(sql);
await pool.end();

console.log("Database tables created");
