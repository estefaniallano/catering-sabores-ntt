import { EventosService } from "./eventos.service";

describe("EventosService.create", () => {
  beforeEach(() => {
    // Congelamos el tiempo para hacer el test determinista
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-04T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("crea un evento en estado BORRADOR por defecto y lo añade al listado", () => {
    const service = new EventosService();

    const input = {
      titulo: "Evento de prueba",
      fechaInicioUtc: new Date("2026-05-10T12:00:00.000Z").toISOString(),
      fechaFinUtc: new Date("2026-05-10T16:00:00.000Z").toISOString(),
      clienteId: "cli_001",
    };

    const created = service.create(input);

    expect(created.id).toMatch(/^evt_/);
    expect(created.titulo).toBe(input.titulo);
    expect(created.fechaInicioUtc).toBe(input.fechaInicioUtc);
    expect(created.fechaFinUtc).toBe(input.fechaFinUtc);
    expect(created.estado).toBe("BORRADOR");
    expect(created.version).toBe(1);
    expect(created.isDeleted).toBe(false);
    expect(created.createdAtUtc).toBe("2026-05-04T10:00:00.000Z");
    expect(created.updatedAtUtc).toBe("2026-05-04T10:00:00.000Z");

    // se ha insertado al principio
    const list = service.list();
    expect(list[0].id).toBe(created.id);
  });

  test("permite crear un evento en estado CONFIRMADO si se proporciona", () => {
    const service = new EventosService();

    const input = {
      titulo: "Evento confirmado",
      fechaInicioUtc: new Date("2026-06-01T12:00:00.000Z").toISOString(),
      fechaFinUtc: new Date("2026-06-01T15:00:00.000Z").toISOString(),
      estado: "CONFIRMADO" as const,
      clienteId: "cli_001",
    };

    const created = service.create(input);

    expect(created.estado).toBe("CONFIRMADO");
  });

  test("error: rechaza crear evento con fecha en el pasado", () => {
    const service = new EventosService();

    const input = {
      titulo: "Evento pasado",
      fechaInicioUtc: new Date("2026-05-01T12:00:00.000Z").toISOString(),
      fechaFinUtc: new Date("2026-05-01T16:00:00.000Z").toISOString(),
      clienteId: "cli_001",
    };

    // En la versión actual del servicio NO existe esta validación.
    // Este test define el comportamiento esperado por QA (CP-02).
    expect(() => service.create(input as any)).toThrow(/pasado|fecha|future/i);
  });

  test("error: rechaza crear evento sin cliente asociado", () => {
    const service = new EventosService();

    // En el dominio real, un evento debe ir asociado a un cliente.
    // En la versión actual del servicio no existe el campo clienteId, por lo que
    // este test define el comportamiento esperado por QA.
    const input = {
      titulo: "Evento sin cliente",
      fechaInicioUtc: new Date("2026-05-10T12:00:00.000Z").toISOString(),
      fechaFinUtc: new Date("2026-05-10T16:00:00.000Z").toISOString(),
      clienteId: undefined,
    };

    expect(() => service.create(input as any)).toThrow(/cliente/i);
  });
});
