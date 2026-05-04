export type EventoEstado = "BORRADOR" | "CONFIRMADO" | "CANCELADO" | "CERRADO";

export interface Evento {
  id: string;
  titulo: string;
  fechaInicioUtc: string; // ISO8601 UTC
  fechaFinUtc: string; // ISO8601 UTC
  estado: EventoEstado;
  version: number;
  isDeleted: boolean; // soft delete lógico
  createdAtUtc: string;
  updatedAtUtc: string;
  deletedAtUtc?: string;
}

export type CrearEventoInput = Pick<Evento, "titulo" | "fechaInicioUtc" | "fechaFinUtc"> & {
  estado?: EventoEstado;
  /**
   * En el dominio, un evento debe estar asociado a un cliente.
   * (QA CP-02: "cliente obligatorio")
   */
  clienteId?: string;
};

export type ActualizarEventoInput = Partial<Pick<Evento, "titulo" | "fechaInicioUtc" | "fechaFinUtc" | "estado">> & {
  version?: number;
};

const nowUtcIso = () => new Date().toISOString();
const newId = () => `evt_${Math.random().toString(16).slice(2)}_${Date.now()}`;

const seed: Evento[] = [
  {
    id: "evt_001",
    titulo: "Boda Finca El Olivo",
    fechaInicioUtc: new Date(Date.now() + 72 * 3600_000).toISOString(),
    fechaFinUtc: new Date(Date.now() + 76 * 3600_000).toISOString(),
    estado: "CONFIRMADO",
    version: 1,
    isDeleted: false,
    createdAtUtc: nowUtcIso(),
    updatedAtUtc: nowUtcIso(),
  },
  {
    id: "evt_002",
    titulo: "Cata empresa",
    fechaInicioUtc: new Date(Date.now() + 20 * 3600_000).toISOString(),
    fechaFinUtc: new Date(Date.now() + 22 * 3600_000).toISOString(),
    estado: "CONFIRMADO",
    version: 3,
    isDeleted: false,
    createdAtUtc: nowUtcIso(),
    updatedAtUtc: nowUtcIso(),
  },
];

export class EventosService {
  private eventos: Evento[] = [...seed];

  list(): Evento[] {
    return this.eventos.filter((e) => !e.isDeleted);
  }

  getById(id: string): Evento | null {
    const found = this.eventos.find((e) => e.id === id && !e.isDeleted);
    return found ?? null;
  }

  create(input: CrearEventoInput): Evento {
    // CP-02 (QA): cliente obligatorio
    if (!input.clienteId) {
      throw new Error("Cliente obligatorio para crear un evento");
    }

    // CP-02 (QA): fecha futura
    const start = new Date(input.fechaInicioUtc);
    if (Number.isNaN(start.getTime())) {
      throw new Error("Fecha de inicio inválida");
    }
    if (start.getTime() < Date.now()) {
      throw new Error("No se puede crear un evento con fecha en el pasado");
    }

    const evento: Evento = {
      id: newId(),
      titulo: input.titulo,
      fechaInicioUtc: input.fechaInicioUtc,
      fechaFinUtc: input.fechaFinUtc,
      estado: input.estado ?? "BORRADOR",
      version: 1,
      isDeleted: false,
      createdAtUtc: nowUtcIso(),
      updatedAtUtc: nowUtcIso(),
    };

    this.eventos.unshift(evento);
    return evento;
  }

  update(id: string, input: ActualizarEventoInput): { evento: Evento } | { conflict: true; current: Evento } | null {
    const idx = this.eventos.findIndex((e) => e.id === id && !e.isDeleted);
    if (idx === -1) return null;

    const current = this.eventos[idx];

    // Simulación de optimistic locking con campo version (si el cliente envía version)
    if (typeof input.version === "number" && input.version !== current.version) {
      return { conflict: true, current };
    }

    const updated: Evento = {
      ...current,
      ...("titulo" in input ? { titulo: input.titulo ?? current.titulo } : {}),
      ...("fechaInicioUtc" in input ? { fechaInicioUtc: input.fechaInicioUtc ?? current.fechaInicioUtc } : {}),
      ...("fechaFinUtc" in input ? { fechaFinUtc: input.fechaFinUtc ?? current.fechaFinUtc } : {}),
      ...("estado" in input ? { estado: input.estado ?? current.estado } : {}),
      version: current.version + 1,
      updatedAtUtc: nowUtcIso(),
    };

    this.eventos[idx] = updated;
    return { evento: updated };
  }

  softDelete(id: string): boolean {
    const idx = this.eventos.findIndex((e) => e.id === id && !e.isDeleted);
    if (idx === -1) return false;

    this.eventos[idx] = {
      ...this.eventos[idx],
      isDeleted: true,
      deletedAtUtc: nowUtcIso(),
      updatedAtUtc: nowUtcIso(),
      version: this.eventos[idx].version + 1,
    };

    return true;
  }
}

export const eventosService = new EventosService();
