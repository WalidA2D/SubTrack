import { Request, Response } from "express";

import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { subscriptionService } from "../services/subscriptionService";

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const data = await subscriptionService.getDashboardSummary(authReq.user.uid);

  res.json({ data });
});
