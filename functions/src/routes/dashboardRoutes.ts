import { Router } from "express";

import { getDashboardSummary } from "../controllers/dashboardController";
import { authenticateRequest } from "../middleware/authMiddleware";

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticateRequest);
dashboardRoutes.get("/summary", getDashboardSummary);
