import { Request, Response } from "express";
import { updateSettingsSchema } from "@subly/shared";

import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { userService } from "../services/userService";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const data = await userService.getProfile(authReq.user.uid);

  res.json({ data });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const payload = updateSettingsSchema.parse(req.body);
  const data = await userService.updateSettings(authReq.user.uid, payload);

  res.json({ data });
});
