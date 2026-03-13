import { Router } from "express";

import { getStatisticsOverview } from "../controllers/statisticsController";
import { authenticateRequest } from "../middleware/authMiddleware";

export const statisticsRoutes = Router();

statisticsRoutes.use(authenticateRequest);
statisticsRoutes.get("/overview", getStatisticsOverview);
