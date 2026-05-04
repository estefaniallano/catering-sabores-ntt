import { eventosService, type Evento } from "./eventos.service";

export interface CocinaEventoResumen {
  id: string;
  titulo: string;
  fechaInicioUtc: string;
  estado: Evento["estado"];
  horasHastaEvento: number;
  alertaMenos48h: boolean;
}

export interface CocinaDashboard {
  totalHoy: number;
  totalProximos7Dias: number;
  alertasMenos48h: number;
  eventos: CocinaEventoResumen[];
}

/**
 * Vista agregada orientada a cocina (solo lectura operativa).
 * Simula una consulta agregada de BBDD.
 */
export class CocinaService {
  getDashboard(now: Date = new Date()): CocinaDashboard {
    const eventos = eventosService
      .list()
      .filter((e) => e.estado !== "CANCELADO")
      .map((e) => this.toResumen(e, now))
      .sort((a, b) => a.fechaInicioUtc.localeCompare(b.fechaInicioUtc));

    const startOfDayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endOfDayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

    const totalHoy = eventos.filter((e) => {
      const d = new Date(e.fechaInicioUtc);
      return d >= startOfDayUtc && d <= endOfDayUtc;
    }).length;

    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 3600_000);
    const totalProximos7Dias = eventos.filter((e) => {
      const d = new Date(e.fechaInicioUtc);
      return d >= startOfDayUtc && d <= sevenDaysAhead;
    }).length;

    const alertasMenos48h = eventos.filter((e) => e.alertaMenos48h).length;

    return { totalHoy, totalProximos7Dias, alertasMenos48h, eventos };
  }

  private toResumen(e: Evento, now: Date): CocinaEventoResumen {
    const diffMs = new Date(e.fechaInicioUtc).getTime() - now.getTime();
    const horasHastaEvento = Math.round((diffMs / 3600_000) * 10) / 10;

    return {
      id: e.id,
      titulo: e.titulo,
      fechaInicioUtc: e.fechaInicioUtc,
      estado: e.estado,
      horasHastaEvento,
      alertaMenos48h: diffMs > 0 && diffMs <= 48 * 3600_000,
    };
  }
}

export const cocinaService = new CocinaService();
