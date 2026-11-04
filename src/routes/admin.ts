import { Router } from "express";
import { pool } from "../lib/db.js";
import { HttpError } from "../lib/httpError.js";
import { requireId, requireOneOf } from "../lib/validate.js";

const roles = ["customer", "agent", "admin"];

export const adminRouter = Router();

adminRouter.patch("/users/:id/role", async (req, res) => {
  const id = requireId(req.params.id, "id");
  const role = requireOneOf(req.body.role, "role", roles);

  const { rows } = await pool.query(
    "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role, created_at",
    [role, id],
  );

  if (!rows[0]) {
    throw new HttpError(404, "User not found");
  }

  res.json(rows[0]);
});
