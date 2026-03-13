import { Router } from "express";

import {
  archiveSubscription,
  createSubscription,
  listSubscriptions,
  updateSubscription
} from "../controllers/subscriptionController";
import { authenticateRequest } from "../middleware/authMiddleware";

export const subscriptionRoutes = Router();

subscriptionRoutes.use(authenticateRequest);
subscriptionRoutes.get("/", listSubscriptions);
subscriptionRoutes.post("/", createSubscription);
subscriptionRoutes.put("/:id", updateSubscription);
subscriptionRoutes.delete("/:id", archiveSubscription);
