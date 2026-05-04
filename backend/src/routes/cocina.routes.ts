import { Router } from "express";
import { CocinaController } from "../controllers/cocina.controller";

const router = Router();

// Vista agregada (solo lectura operativa)
router.get("/", CocinaController.getDashboard);

export default router;
