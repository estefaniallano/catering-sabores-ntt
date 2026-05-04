import { type Request, type Response } from "express";
import { eventosService, type ActualizarEventoInput, type CrearEventoInput } from "../services/eventos.service";

const isIsoDate = (v: unknown) => typeof v === "string" && !Number.isNaN(Date.parse(v));

export const EventosController = {
  list: (req: Request, res: Response) => {
    const includeDeleted = String(req.query.includeDeleted ?? "") === "true";
    const items = eventosService.list();

    // Por ahora solo devolvemos activos; si pidiesen borrados, habría que exponer método adicional.
    if (includeDeleted) {
      return res.status(200).json({ data: items, note: "includeDeleted=true no está implementado con mock" });
    }

    return res.status(200).json({ data: items });
  },

  getById: (req: Request, res: Response) => {
    // En algunos tipos de Express, los params pueden tipar como string | string[]
    // (por compatibilidad con ParsedQs / qs). Normalizamos para asegurar string.
    const rawId = (req.params as Record<string, string | string[] | undefined>).id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) return res.status(400).json({ message: "id es obligatorio" });

    const evento = eventosService.getById(id);
    if (!evento) return res.status(404).json({ message: "Evento no encontrado" });
    return res.status(200).json({ data: evento });
  },

  create: (req: Request, res: Response) => {
    const body = req.body as Partial<CrearEventoInput>;

    if (!body.titulo || typeof body.titulo !== "string") {
      return res.status(400).json({ message: "titulo es obligatorio" });
    }
    if (!body.fechaInicioUtc || !isIsoDate(body.fechaInicioUtc)) {
      return res.status(400).json({ message: "fechaInicioUtc debe ser ISO8601" });
    }
    if (!body.fechaFinUtc || !isIsoDate(body.fechaFinUtc)) {
      return res.status(400).json({ message: "fechaFinUtc debe ser ISO8601" });
    }

    const created = eventosService.create({
      titulo: body.titulo,
      fechaInicioUtc: body.fechaInicioUtc,
      fechaFinUtc: body.fechaFinUtc,
      estado: body.estado,
    });

    return res.status(201).json({ data: created });
  },

  update: (req: Request, res: Response) => {
    const rawId = (req.params as Record<string, string | string[] | undefined>).id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) return res.status(400).json({ message: "id es obligatorio" });

    const body = req.body as ActualizarEventoInput;

    if (body.fechaInicioUtc && !isIsoDate(body.fechaInicioUtc)) {
      return res.status(400).json({ message: "fechaInicioUtc debe ser ISO8601" });
    }
    if (body.fechaFinUtc && !isIsoDate(body.fechaFinUtc)) {
      return res.status(400).json({ message: "fechaFinUtc debe ser ISO8601" });
    }

    const result = eventosService.update(id, body);

    if (!result) return res.status(404).json({ message: "Evento no encontrado" });
    if ("conflict" in result) {
      return res.status(409).json({
        message: "Conflicto de versión (optimistic locking)",
        current: result.current,
      });
    }

    return res.status(200).json({ data: result.evento });
  },

  softDelete: (req: Request, res: Response) => {
    const rawId = (req.params as Record<string, string | string[] | undefined>).id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) return res.status(400).json({ message: "id es obligatorio" });

    const ok = eventosService.softDelete(id);
    if (!ok) return res.status(404).json({ message: "Evento no encontrado" });

    return res.status(200).json({ message: "Evento desactivado (borrado lógico)" });
  },
};
