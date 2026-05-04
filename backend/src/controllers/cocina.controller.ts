import { type Request, type Response } from "express";
import { cocinaService } from "../services/cocina.service";

export const CocinaController = {
  getDashboard: (_req: Request, res: Response) => {
    const dashboard = cocinaService.getDashboard();
    return res.status(200).json({ data: dashboard });
  },
};
