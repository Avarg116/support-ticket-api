import bcrypt from "bcryptjs";
import { Router } from "express";
import { pool } from "../lib/db.js";
import { HttpError } from "../lib/httpError.js";
import { requireString } from "../lib/validate.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const email = requireString(req.body.email, "email").toLowerCase();
  const password = requireString(req.body.password, "password");

  if (password.length < 8) {
    throw new HttpError(400, "password must be at least 8 characters");
  }

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows[0]) {
    throw new HttpError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role, created_at",
    [email, passwordHash],
  );

  res.status(201).json(rows[0]);
});
