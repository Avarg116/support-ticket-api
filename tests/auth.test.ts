import jwt from "jsonwebtoken";
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
  it("returns a token for the right password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "customer1@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects the wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "customer1@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid email or password" });
  });
});

describe("protected routes", () => {
  it("rejects a request with no token", async () => {
    const res = await request(app).get("/tickets");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("rejects an expired token", async () => {
    const token = jwt.sign({ id: 4, role: "customer" }, process.env.JWT_SECRET as string, {
      expiresIn: -1,
    });

    const res = await request(app).get("/tickets").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });
});
