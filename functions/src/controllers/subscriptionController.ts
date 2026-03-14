import { Request, Response } from "express";
import {
  subscriptionInputSchema,
  subscriptionQuerySchema
} from "@subly/shared";

import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { subscriptionService } from "../services/subscriptionService";

export const listSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const query = subscriptionQuerySchema.parse({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    sort: typeof req.query.sort === "string" ? req.query.sort : undefined
  });

  const data = await subscriptionService.listSubscriptions(authReq.user.uid, query);

  res.json({
    data,
    meta: {
      total: data.length
    }
  });
});

export const createSubscription = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const payload = subscriptionInputSchema.parse(req.body);
  const data = await subscriptionService.createSubscription(authReq.user.uid, payload);

  res.status(201).json({ data });
});

export const updateSubscription = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const payload = subscriptionInputSchema.partial().parse(req.body);
  const data = await subscriptionService.updateSubscription(authReq.user.uid, req.params.id, payload);

  res.json({ data });
});

export const archiveSubscription = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await subscriptionService.archiveSubscription(authReq.user.uid, req.params.id);

  res.json({
    message: "Abonnement archive."
  });
});
