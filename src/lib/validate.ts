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
