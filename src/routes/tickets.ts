import { Router } from "express";
import { pool } from "../lib/db.js";
import { HttpError } from "../lib/httpError.js";
import { requireId, requireOneOf, requireString } from "../lib/validate.js";

const priorities = ["urgent", "high", "normal", "low"];

export const ticketsRouter = Router();

ticketsRouter.get("/", async (req, res) => {
  const { status, priority } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);

  const { rows } = await pool.query(
    `SELECT * FROM tickets
     WHERE ($1::text IS NULL OR status = $1)
       AND ($2::text IS NULL OR priority = $2)
     ORDER BY id
     LIMIT 20 OFFSET $3`,
    [status ?? null, priority ?? null, (page - 1) * 20],
  );

  res.json({ page, tickets: rows });
});

ticketsRouter.post("/", async (req, res) => {
  const subject = requireString(req.body.subject, "subject");
  const description = requireString(req.body.description, "description");
  const priority = requireOneOf(req.body.priority ?? "normal", "priority", priorities);
  const customerId = requireId(req.body.customer_id, "customer_id");

  const { rows } = await pool.query(
    `INSERT INTO tickets (subject, description, priority, customer_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [subject, description, priority, customerId],
  );

  res.status(201).json(rows[0]);
});

ticketsRouter.get("/:id", async (req, res) => {
  const id = requireId(req.params.id, "id");

  const ticketResult = await pool.query("SELECT * FROM tickets WHERE id = $1", [id]);
  const ticket = ticketResult.rows[0];
  if (!ticket) {
    throw new HttpError(404, "Ticket not found");
  }

  const commentResult = await pool.query(
    "SELECT * FROM comments WHERE ticket_id = $1 ORDER BY id",
    [id],
  );

  res.json({ ...ticket, comments: commentResult.rows });
});

ticketsRouter.patch("/:id", async (req, res) => {
  const id = requireId(req.params.id, "id");
  const subject = req.body.subject === undefined ? null : requireString(req.body.subject, "subject");
  const description =
    req.body.description === undefined ? null : requireString(req.body.description, "description");
  const priority =
    req.body.priority === undefined ? null : requireOneOf(req.body.priority, "priority", priorities);

  const { rows } = await pool.query(
    `UPDATE tickets
     SET subject = COALESCE($1, subject),
         description = COALESCE($2, description),
         priority = COALESCE($3, priority),
         updated_at = now()
     WHERE id = $4
     RETURNING *`,
    [subject, description, priority, id],
  );

  if (!rows[0]) {
    throw new HttpError(404, "Ticket not found");
  }

  res.json(rows[0]);
});

ticketsRouter.post("/:id/comments", async (req, res) => {
  const ticketId = requireId(req.params.id, "id");
  const authorId = requireId(req.body.author_id, "author_id");
  const text = requireString(req.body.body, "body");

  const ticketResult = await pool.query("SELECT id FROM tickets WHERE id = $1", [ticketId]);
  if (!ticketResult.rows[0]) {
    throw new HttpError(404, "Ticket not found");
  }

  const { rows } = await pool.query(
    "INSERT INTO comments (ticket_id, author_id, body) VALUES ($1, $2, $3) RETURNING *",
    [ticketId, authorId, text],
  );

  res.status(201).json(rows[0]);
});
