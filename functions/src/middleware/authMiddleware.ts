import { NextFunction, Request, Response } from "express";

import { adminAuth } from "../config/firebaseAdmin";
import { ensureDemoWorkspace } from "../services/demoWorkspaceService";
import { userService } from "../services/userService";
import { ApiError } from "../utils/apiError";

export type AuthenticatedRequest = Request & {
  user: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  };
};

export async function authenticateRequest(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const isEmulator =
      process.env.FUNCTIONS_EMULATOR === "true" ||
      Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);
    const mockUserId =
      typeof req.headers["x-subly-mock-user"] === "string"
        ? req.headers["x-subly-mock-user"].trim()
        : "";

    if (isEmulator && mockUserId) {
      const mockEmail =
        typeof req.headers["x-subly-mock-email"] === "string"
          ? req.headers["x-subly-mock-email"].trim()
          : `${mockUserId}@subly.local`;
      const mockDisplayName =
        typeof req.headers["x-subly-mock-name"] === "string"
          ? req.headers["x-subly-mock-name"].trim()
          : "Utilisateur Subly";

      await ensureDemoWorkspace({
        uid: mockUserId,
        email: mockEmail,
        displayName: mockDisplayName
      });

      (req as AuthenticatedRequest).user = {
        uid: mockUserId,
        email: mockEmail,
        displayName: mockDisplayName
      };

      next();
      return;
    }

    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(401, "Jeton Firebase manquant.");
    }

    const token = authorization.replace("Bearer ", "");
    const decodedToken = await adminAuth.verifyIdToken(token);

    await userService.provisionUserProfile({
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoURL: typeof decodedToken.picture === "string" ? decodedToken.picture : null
    });

    (req as AuthenticatedRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name
    };

    next();
  } catch (error) {
    next(error);
  }
}
