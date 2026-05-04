import { Router } from "express";
import { EventosController } from "../controllers/eventos.controller";

const router = Router();

// RESTful
router.get("/", EventosController.list);
router.get("/:id", EventosController.getById);
router.post("/", EventosController.create);
router.put("/:id", EventosController.update);

// DELETE lógico (soft delete)
router.delete("/:id", EventosController.softDelete);

export default router;
