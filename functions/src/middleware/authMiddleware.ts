import { NextFunction, Request, Response } from "express";

import { adminAuth } from "../config/firebaseAdmin";
import { ApiError } from "../utils/apiError";

export type AuthenticatedRequest = Request & {
  user: {
    uid: string;
    email?: string | null;
  };
};

export async function authenticateRequest(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing Firebase ID token.");
    }

    const token = authorization.replace("Bearer ", "");
    const decodedToken = await adminAuth.verifyIdToken(token);

    (req as AuthenticatedRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };

    next();
  } catch (error) {
    next(error);
  }
}
