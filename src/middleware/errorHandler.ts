import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Default
  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Log error (dev)
  if (process.env.NODE_ENV !== "production") {
    console.error("💥 ERROR:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
