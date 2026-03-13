import { Router } from "express";

import { getProfile, updateSettings } from "../controllers/settingsController";
import { authenticateRequest } from "../middleware/authMiddleware";

export const settingsRoutes = Router();

settingsRoutes.use(authenticateRequest);
settingsRoutes.get("/profile", getProfile);
settingsRoutes.patch("/", updateSettings);
