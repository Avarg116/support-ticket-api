import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { resetDatabase } from "../db/reset.js";
import { createApp } from "../src/app.js";
import { pool } from "../src/lib/db.js";

const app = createApp();

async function login(email: string) {
  const res = await request(app).post("/auth/login").send({ email, password: "password123" });
  return `Bearer ${res.body.token}`;
}

beforeEach(() => resetDatabase());
afterAll(() => pool.end());

describe("customers", () => {
  it("get a 404 for another customer's ticket", async () => {
    const auth = await login("customer1@example.com");

    const view = await request(app).get("/tickets/4").set("Authorization", auth);
    const edit = await request(app)
      .patch("/tickets/4")
      .set("Authorization", auth)
      .send({ priority: "low" });
    const comment = await request(app)
      .post("/tickets/4/comments")
      .set("Authorization", auth)
      .send({ body: "Hello?" });

    expect(view.status).toBe(404);
    expect(edit.status).toBe(404);
    expect(comment.status).toBe(404);
  });

  it("get a 403 on admin routes", async () => {
    const auth = await login("customer1@example.com");

    const res = await request(app)
      .patch("/admin/users/4/role")
      .set("Authorization", auth)
      .send({ role: "admin" });

    expect(res.status).toBe(403);
  });
});

describe("agents", () => {
  it("can see every ticket", async () => {
    const auth = await login("agent1@example.com");

    const res = await request(app).get("/tickets").set("Authorization", auth);

    expect(res.body.tickets).toHaveLength(5);
  });
});

describe("admins", () => {
  it("can change a user's role", async () => {
    const auth = await login("admin@example.com");

    const res = await request(app)
      .patch("/admin/users/5/role")
      .set("Authorization", auth)
      .send({ role: "agent" });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe("agent");
  });
});
