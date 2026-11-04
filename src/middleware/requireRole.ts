import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";

export function requireRole(...roles: string[]): RequestHandler {
  return (_req, res, next) => {
    if (!roles.includes(res.locals.user.role)) {
      throw new HttpError(403, "Forbidden");
    }

    next();
  };
}
