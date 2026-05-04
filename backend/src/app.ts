import express, { type Request, type Response, type NextFunction } from "express";
import eventosRouter from "./routes/eventos.routes";
import cocinaRouter from "./routes/cocina.routes";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/v1/eventos", eventosRouter);
  app.use("/api/v1/cocina", cocinaRouter);

  // 404
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Not Found" });
  });

  // error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  });

  return app;
};
