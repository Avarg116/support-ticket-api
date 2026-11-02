import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("error handling", () => {
  it("returns 404 JSON for an unknown route", async () => {
    const res = await request(createApp()).get("/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });
});
