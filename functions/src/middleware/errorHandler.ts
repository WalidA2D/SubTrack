import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ApiError } from "../utils/apiError";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed.",
      errors: error.flatten()
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  res.status(500).json({
    message: error instanceof Error ? error.message : "Internal server error."
  });
}
