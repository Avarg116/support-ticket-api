import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../lib/httpError.js";

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    res.locals.user = jwt.verify(token, process.env.JWT_SECRET as string);
  } catch {
    throw new HttpError(401, "Unauthorized");
  }

  next();
};
