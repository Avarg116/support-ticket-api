import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { resetDatabase } from "../db/reset.js";
import { createApp } from "../src/app.js";
import { pool } from "../src/lib/db.js";

const app = createApp();

beforeEach(() => resetDatabase());
afterAll(() => pool.end());

describe("POST /tickets", () => {
  it("creates a ticket", async () => {
    const res = await request(app).post("/tickets").send({
      subject: "Password reset email never arrives",
      description: "I requested it three times.",
      priority: "high",
      customer_id: 4,
    });

    expect(res.status).toBe(201);
    expect(res.body.subject).toBe("Password reset email never arrives");
    expect(res.body.status).toBe("open");
  });

  it("rejects a missing subject", async () => {
    const res = await request(app)
      .post("/tickets")
      .send({ description: "No subject", customer_id: 4 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "subject is required" });
  });
});

describe("GET /tickets", () => {
  it("lists tickets and filters by status and priority", async () => {
    const all = await request(app).get("/tickets");
    const open = await request(app).get("/tickets?status=open");
    const low = await request(app).get("/tickets?priority=low");

    expect(all.body.tickets).toHaveLength(5);
    expect(open.body.tickets.map((t: any) => t.id)).toEqual([1, 4]);
    expect(low.body.tickets.map((t: any) => t.id)).toEqual([3, 5]);
  });
});

describe("GET /tickets/:id", () => {
  it("returns the ticket with its comments", async () => {
    const res = await request(app).get("/tickets/2");

    expect(res.status).toBe(200);
    expect(res.body.subject).toBe("Invoice shows the wrong amount");
    expect(res.body.comments).toHaveLength(2);
  });

  it("returns 404 for a ticket that does not exist", async () => {
    const res = await request(app).get("/tickets/999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Ticket not found" });
  });
});

describe("PATCH /tickets/:id", () => {
  it("updates only the fields sent", async () => {
    const res = await request(app).patch("/tickets/4").send({ priority: "high" });

    expect(res.status).toBe(200);
    expect(res.body.priority).toBe("high");
    expect(res.body.subject).toBe("App crashes when uploading a photo");
  });
});

describe("POST /tickets/:id/comments", () => {
  it("adds a comment that shows up on the ticket", async () => {
    const res = await request(app)
      .post("/tickets/2/comments")
      .send({ author_id: 2, body: "I've refunded the duplicate charge." });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ticket_id: 2, author_id: 2 });

    const ticket = await request(app).get("/tickets/2");
    expect(ticket.body.comments).toHaveLength(3);
  });
});
