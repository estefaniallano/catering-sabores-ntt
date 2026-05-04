-- Catering Sabores de Casa - PostgreSQL DDL
-- Archivo: database/init.sql
-- Convenciones:
-- - Todas las PK son UUID
-- - Timestamps en UTC (se recomienda que la app escriba en UTC)
-- - Soft delete: is_active en maestras (usuarios, clientes, catálogo, trabajadores)
-- - Control de concurrencia: version en eventos
-- - Restricciones de negocio con CHECKs (las más complejas se validan en backend)

BEGIN;

-- Extensiones necesarias para UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tipos enumerados (estados y roles)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_usuario') THEN
    CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'COMERCIAL', 'COCINA', 'RRHH');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_evento') THEN
    -- Nota: en el documento aparecen variantes PREPARACION / EN_PREPARACION.
    -- Unificamos a EN_PREPARACION.
    CREATE TYPE estado_evento AS ENUM ('BORRADOR', 'PLANIFICADO', 'EN_PREPARACION', 'FINALIZADO', 'CANCELADO');
  END IF;
END $$;

-- =========================
-- Tabla: usuarios
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL,
  password_hash     TEXT NOT NULL,
  rol               rol_usuario NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT usuarios_email_unq UNIQUE (email),
  CONSTRAINT usuarios_email_chk CHECK (position('@' in email) > 1)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios (rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_is_active ON usuarios (is_active);

-- =========================
-- Tabla: clientes
-- =========================
CREATE TABLE IF NOT EXISTS clientes (
  id_cliente             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social           TEXT NOT NULL,
  identificador_fiscal   TEXT NOT NULL,
  telefono_contacto      TEXT,
  email                  TEXT,
  direccion              TEXT,
  is_active              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT clientes_identificador_fiscal_unq UNIQUE (identificador_fiscal),
  CONSTRAINT clientes_email_chk CHECK (email IS NULL OR position('@' in email) > 1)
);

CREATE INDEX IF NOT EXISTS idx_clientes_razon_social ON clientes (razon_social);
CREATE INDEX IF NOT EXISTS idx_clientes_is_active ON clientes (is_active);

-- =========================
-- Tabla: catalogo_productos (catálogo)
-- =========================
CREATE TABLE IF NOT EXISTS catalogo_productos (
  id_plato_catalogo  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre             TEXT NOT NULL,
  categoria          TEXT NOT NULL,
  unidad_medida      TEXT NOT NULL,
  alergenos          TEXT, -- lista textual / JSON según evolución; por ahora TEXT
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Evita duplicados exactos por nombre dentro de una categoría (regla razonable)
  CONSTRAINT catalogo_nombre_categoria_unq UNIQUE (nombre, categoria)
);

CREATE INDEX IF NOT EXISTS idx_catalogo_is_active ON catalogo_productos (is_active);
CREATE INDEX IF NOT EXISTS idx_catalogo_categoria ON catalogo_productos (categoria);

-- =========================
-- Tabla: eventos
-- =========================
CREATE TABLE IF NOT EXISTS eventos (
  id_evento        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente       UUID NOT NULL REFERENCES clientes(id_cliente) ON UPDATE RESTRICT ON DELETE RESTRICT,

  fecha_inicio     TIMESTAMPTZ NOT NULL,
  fecha_fin        TIMESTAMPTZ NOT NULL,
  ubicacion        TEXT NOT NULL,
  aforo_estimado   INTEGER NOT NULL,
  estado           estado_evento NOT NULL DEFAULT 'BORRADOR',
  notas_alergias   TEXT,

  -- Cancelación (motivo obligatorio si estado=CANCELADO)
  motivo_cancelacion TEXT,

  -- Optimistic locking
  version         INTEGER NOT NULL DEFAULT 1,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT eventos_fechas_chk CHECK (fecha_inicio < fecha_fin),
  CONSTRAINT eventos_aforo_chk CHECK (aforo_estimado > 0),
  CONSTRAINT eventos_cancelacion_motivo_chk CHECK (
    (estado <> 'CANCELADO' AND motivo_cancelacion IS NULL)
    OR
    (estado = 'CANCELADO' AND motivo_cancelacion IS NOT NULL AND length(btrim(motivo_cancelacion)) >= 10)
  )
);

CREATE INDEX IF NOT EXISTS idx_eventos_cliente ON eventos (id_cliente);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_inicio ON eventos (fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos (estado);

-- =========================
-- Tabla: menus_evento (relación evento <-> catálogo)
-- =========================
CREATE TABLE IF NOT EXISTS menus_evento (
  id_menu_evento     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_evento          UUID NOT NULL REFERENCES eventos(id_evento) ON UPDATE RESTRICT ON DELETE RESTRICT,
  id_plato_catalogo  UUID NOT NULL REFERENCES catalogo_productos(id_plato_catalogo) ON UPDATE RESTRICT ON DELETE RESTRICT,
  cantidad_raciones  INTEGER NOT NULL,
  observaciones      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT menus_evento_raciones_chk CHECK (cantidad_raciones > 0),
  CONSTRAINT menus_evento_unq UNIQUE (id_evento, id_plato_catalogo)
);

CREATE INDEX IF NOT EXISTS idx_menus_evento_evento ON menus_evento (id_evento);
CREATE INDEX IF NOT EXISTS idx_menus_evento_plato ON menus_evento (id_plato_catalogo);

-- =========================
-- Tabla: trabajadores
-- =========================
CREATE TABLE IF NOT EXISTS trabajadores (
  id_trabajador  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         TEXT NOT NULL,
  telefono       TEXT,
  especialidad   TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trabajadores_is_active ON trabajadores (is_active);
CREATE INDEX IF NOT EXISTS idx_trabajadores_nombre ON trabajadores (nombre);

-- =========================
-- Tabla: cuadrantes_personal (relación evento <-> trabajador)
-- =========================
CREATE TABLE IF NOT EXISTS cuadrantes_personal (
  id_cuadrante     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_evento        UUID NOT NULL REFERENCES eventos(id_evento) ON UPDATE RESTRICT ON DELETE RESTRICT,
  id_trabajador    UUID NOT NULL REFERENCES trabajadores(id_trabajador) ON UPDATE RESTRICT ON DELETE RESTRICT,
  hora_entrada     TIMESTAMPTZ NOT NULL,
  hora_salida      TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT cuadrantes_horas_chk CHECK (hora_entrada < hora_salida),
  -- evita duplicidad exacta del mismo tramo para el mismo trabajador
  CONSTRAINT cuadrantes_tramo_unq UNIQUE (id_trabajador, hora_entrada, hora_salida)
);

CREATE INDEX IF NOT EXISTS idx_cuadrantes_evento ON cuadrantes_personal (id_evento);
CREATE INDEX IF NOT EXISTS idx_cuadrantes_trabajador ON cuadrantes_personal (id_trabajador);
CREATE INDEX IF NOT EXISTS idx_cuadrantes_intervalo ON cuadrantes_personal (hora_entrada, hora_salida);

-- Restricción de NO solapamiento por trabajador:
-- Usamos EXCLUDE constraint con rango tsrange (requiere btree_gist).
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE cuadrantes_personal
  ADD CONSTRAINT IF NOT EXISTS cuadrantes_no_solape_por_trabajador
  EXCLUDE USING GIST (
    id_trabajador WITH =,
    tstzrange(hora_entrada, hora_salida, '[)') WITH &&
  );

-- =========================
-- Tabla: auditoria_eventos (trazabilidad)
-- =========================
CREATE TABLE IF NOT EXISTS auditoria_eventos (
  id_auditoria      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_evento         UUID NOT NULL REFERENCES eventos(id_evento) ON UPDATE RESTRICT ON DELETE RESTRICT,
  id_usuario        UUID REFERENCES usuarios(id_usuario) ON UPDATE RESTRICT ON DELETE SET NULL,
  ip               INET,
  timestamp_utc     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  campo_modificado  TEXT NOT NULL,
  valor_anterior    TEXT,
  valor_nuevo       TEXT
);

CREATE INDEX IF NOT EXISTS idx_auditoria_evento ON auditoria_eventos (id_evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria_eventos (timestamp_utc);

-- =========================
-- Tabla: incidencias_evento
-- =========================
CREATE TABLE IF NOT EXISTS incidencias_evento (
  id_incidencia  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_evento      UUID NOT NULL REFERENCES eventos(id_evento) ON UPDATE RESTRICT ON DELETE RESTRICT,
  descripcion    TEXT NOT NULL,
  creada_por     UUID REFERENCES usuarios(id_usuario) ON UPDATE RESTRICT ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT incidencias_descripcion_chk CHECK (length(btrim(descripcion)) >= 5)
);

CREATE INDEX IF NOT EXISTS idx_incidencias_evento ON incidencias_evento (id_evento);
CREATE INDEX IF NOT EXISTS idx_incidencias_created_at ON incidencias_evento (created_at);

COMMIT;
