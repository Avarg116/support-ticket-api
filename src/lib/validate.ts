import { HttpError } from "./httpError.js";

export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `${field} is required`);
  }
  return value.trim();
}

export function requireOneOf(value: unknown, field: string, allowed: string[]): string {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new HttpError(400, `${field} must be one of: ${allowed.join(", ")}`);
  }
  return value;
}

export function requireId(value: unknown, field: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `${field} must be a positive whole number`);
  }
  return id;
}
