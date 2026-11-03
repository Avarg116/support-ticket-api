import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { resetDatabase } from "../db/reset.js";
import { createApp } from "../src/app.js";
import { pool } from "../src/lib/db.js";

const app = createApp();

beforeEach(() => resetDatabase());
afterAll(() => pool.end());

describe("POST /auth/register", () => {
  it("creates a customer without returning the password", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "newuser@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("customer");
    expect(res.body.password_hash).toBeUndefined();
  });
});

describe("POST /auth/login", () => {
  beforeEach(async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "newuser@example.com", password: "password123" });
  });

  it("returns a token for the right password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "newuser@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects the wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "newuser@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid email or password" });
  });
});
