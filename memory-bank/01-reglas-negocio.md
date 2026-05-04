# 01-reglas-negocio.md

## Objetivo del sistema

Sistema web interno para **Catering Sabores de Casa** orientado a centralizar la planificación operativa de eventos de catering, eliminando la gestión dispersa en Excel, correos y mensajería informal.

El sistema debe actuar como **fuente única de verdad** para las áreas de:
- Ventas / Comercial
- Cocina / Producción
- RRHH / Talento
- Operaciones / Sala
- Dirección / Administración

---

## Alcance funcional

El producto cubre:

- Gestión del ciclo de vida completo de eventos
- Gestión de clientes (CRM básico)
- Gestión de catálogo gastronómico
- Consolidación de producción semanal para cocina
- Alertas críticas por cambios de última hora
- Proyección de necesidades de RRHH
- Asignación de cuadrantes y personal eventual
- Seguridad por roles (RBAC)
- Exportación histórica y visor operativo para sala

---

## Problema de negocio que resuelve

Situación actual:
- Registro de eventos en hojas de cálculo aisladas
- Cambios informados por correo, llamadas o mensajes sin trazabilidad
- Falta de sincronización entre comercial, cocina y RRHH
- Riesgos operativos por datos inconsistentes

Impactos detectados:
- Pérdida de datos críticos
- Sobrecostes por compras urgentes
- Mermas por cambios no comunicados
- Déficit de personal en eventos

Necesidad principal:
- Centralizar toda la operativa en una única plataforma con trazabilidad, reglas de negocio y control de acceso.

---

## Actores del sistema

### Comercial / Ventas
Responsable de:
- Alta de clientes
- Alta de eventos
- Configuración del menú del evento
- Actualización de aforo y menú
- Cancelación de eventos

### Cocina / Producción
Responsable de:
- Consulta del consolidado semanal
- Revisión de cantidades a producir
- Recepción y confirmación de alertas críticas

### RRHH / Talento
Responsable de:
- Proyección de necesidades de personal
- Asignación de trabajadores a eventos
- Control de solapamientos

### Jefe de Sala / Operaciones
Responsable de:
- Consulta operativa del evento en campo
- Confirmación de cierre del evento
- Registro de incidencias post-evento

### Dirección / Administración
Responsable de:
- Gestión del catálogo maestro
- Gestión global de clientes
- Consulta de históricos
- Exportación de datos
- Supervisión transversal

---

## Requisitos funcionales resumidos

## RF-01 Registro centralizado de eventos
El sistema debe permitir crear un evento con:
- Cliente
- Fecha
- Hora inicio y fin
- Ubicación
- Aforo estimado

### Reglas:
- No se puede crear un evento con fecha pasada
- Cliente obligatorio
- Si el cliente no existe, debe crearse previamente
- Hora inicio < hora fin
- El sistema genera un identificador único de evento

---

## RF-02 Gestión del menú del evento
Cada evento puede tener platos o menús asociados desde el catálogo.

### Reglas:
- Prohibido introducir platos en texto libre
- Todo plato debe existir en catálogo
- Se permiten observaciones por línea
- Cada línea debe registrar cantidad de raciones

---

## RF-03 Motor de estados del evento
Estados permitidos:
- BORRADOR / REGISTRADO
- PLANIFICADO
- EN_PREPARACION
- FINALIZADO
- CANCELADO

### Reglas:
- FINALIZADO y CANCELADO son irreversibles
- Eventos en estos estados quedan en modo solo lectura
- La transición puede ser manual o automática por procesos programados

---

## RF-04 Auditoría y trazabilidad
Cualquier modificación relevante en eventos activos debe dejar traza.

### Debe registrarse:
- Usuario
- Timestamp UTC
- Campo modificado
- Valor anterior
- Valor nuevo
- IP si aplica

---

## RF-05 Cancelación de eventos
Debe poder cancelarse un evento mediante acción explícita.

### Reglas:
- Motivo obligatorio
- Longitud mínima del motivo: al menos 10-15 caracteres según documento
- La cancelación:
  - cambia el estado a CANCELADO
  - libera al personal asignado
  - excluye el evento de cocina y RRHH
- Es irreversible

---

## RF-06 Catálogo maestro
CRUD para productos/platos/menús base.

### Reglas:
- Campos básicos: nombre, categoría, unidad de medida, alérgenos
- Solo administración/dirección pueden modificar el catálogo
- Eliminación lógica únicamente
- Un producto descatalogado no desaparece de históricos

---

## RF-07 Consolidado semanal de producción
Vista agregada para cocina con sumatorio de raciones por producto.

### Reglas:
- Solo incluye eventos en PLANIFICADO o EN_PREPARACION
- Excluye BORRADOR y CANCELADO
- Oculta información económica y datos irrelevantes para cocina

---

## RF-08 Alertas críticas de última hora
Si se modifica un evento a menos de 48 horas de su ejecución, cocina debe recibir una alerta.

### Reglas:
- Trigger automático ante cambio relevante
- Banner visual persistente
- Debe mostrar el diferencial del cambio
- Requiere confirmación manual para desaparecer

---

## RF-09 CRM básico de clientes
Gestión de clientes y búsqueda rápida.

### Reglas:
- No puede haber duplicados por NIF/CIF
- Búsqueda rápida por coincidencia parcial
- Visibilidad parcial para ciertos roles

---

## RF-10 Proyección analítica de RRHH
Panel que calcula necesidad de personal según aforo.

### Reglas:
- Cálculo basado en ratio parametrizable
- Visualización diaria o mensual
- Orientado a anticipar contrataciones

---

## RF-11 Asignación de cuadrantes y personal
Asignación de trabajadores a eventos.

### Reglas:
- No se puede asignar un trabajador a dos eventos solapados
- La validación debe hacerse en backend
- En conflicto se devuelve `409 Conflict`

---

## RF-12 Seguridad perimetral y RBAC
El sistema restringe acceso por rol a módulos, acciones y datos.

### Reglas:
- Cocina no puede ver clientes, RRHH ni datos económicos
- Comercial no puede acceder a RRHH ni a gestión maestra de catálogo
- El backend siempre valida permisos
- Forzar URL sin permisos debe bloquear el acceso

---

## RF-13 Modo quiosco para sala
Vista simplificada para tablets durante el evento.

### Características:
- Sin navegación lateral
- Solo información del evento asignado
- Running order
- Distribución de platos
- Alertas de alérgenos visibles

---

## RF-14 Exportación e histórico
Permite exportar eventos para análisis y conciliación.

### Reglas:
- Exportación CSV
- Filtros por periodo
- Solo lectura
- Incluye estado, aforo final y cliente

---

## Interacciones clave del usuario

## INT-01 Alta de servicio
Flujo:
1. Comercial accede a Servicios
2. Crea nuevo servicio
3. Introduce datos obligatorios
4. Selecciona menú desde catálogo
5. Guarda

---

## INT-02 Ajuste de servicio activo
Flujo:
1. Comercial abre evento activo
2. Modifica aforo o menú
3. Guarda cambios
4. Se registra auditoría
5. Si faltan menos de 48h, se dispara alerta a cocina

---

## INT-03 Panel de producción semanal
Flujo:
1. Cocina accede al módulo de producción
2. Filtra por semana
3. Consulta sumatorios agregados por plato

---

## INT-04 Avisos críticos de última hora
Flujo:
1. Comercial modifica evento próximo
2. Cocina recibe alerta en tiempo real
3. Cocina revisa impacto
4. Cocina confirma recepción

---

## INT-05 Proyección de capacidad laboral
Flujo:
1. RRHH abre módulo de talento
2. Consulta volumen de comensales por fecha
3. El sistema calcula personal recomendado

---

## INT-06 Cuadrante de personal eventual
Flujo:
1. RRHH abre evento
2. Entra en pestaña Personal
3. Asigna trabajadores
4. Backend valida solapamientos
5. Guarda si no hay conflicto

---

## INT-07 Cancelación de servicio
Flujo:
1. Usuario autorizado abre evento
2. Pulsa cancelar
3. Introduce motivo
4. Confirma
5. El sistema libera recursos y actualiza proyecciones

---

## INT-08 Cierre de evento
Flujo:
1. Jefe de sala abre evento del día o pasado
2. Marca como finalizado
3. El backend valida fecha
4. El evento queda bloqueado para edición futura

---

## INT-09 Alta de clientes
Flujo:
1. Comercial accede a Clientes
2. Crea cliente
3. Introduce datos obligatorios
4. El sistema valida duplicidad fiscal

---

## INT-10 Consulta de clientes
Flujo:
1. Usuario autorizado busca por nombre o empresa
2. El sistema devuelve resultados con búsqueda parcial
3. Según rol, muestra más o menos información

---

## INT-11 Desactivación lógica de clientes
Flujo:
1. Administración abre ficha del cliente
2. Pulsa desactivar
3. El cliente deja de estar disponible para nuevos eventos
4. Los históricos se conservan

---

## INT-12 Alta de producto de catálogo
Flujo:
1. Administración abre catálogo
2. Crea nuevo producto
3. Indica categoría y unidad
4. Guarda

---

## INT-13 Desactivación de producto
Flujo:
1. Administración selecciona producto
2. Lo descataloga
3. El sistema avisa si afecta a eventos futuros

---

## INT-14 Registro de incidencias post-evento
Flujo:
1. Jefe de sala abre evento finalizado
2. Registra incidencia
3. Se notifica a comercial y dirección

---

## INT-15 Consulta del histórico
Flujo:
1. Dirección filtra por año o periodo
2. Consulta listado de eventos finalizados/cancelados
3. Exporta CSV si lo necesita

---

## INT-16 Login y control de acceso
Flujo:
1. Usuario introduce email y contraseña
2. El sistema autentica
3. Devuelve token
4. El frontend muestra módulos según rol
5. Cierre automático tras inactividad

---

## Reglas generales de negocio

- Todo timestamp debe almacenarse en UTC
- La interfaz debe representar horas según la zona horaria del usuario
- No se permite texto libre para definir menús
- El sistema debe ser la única fuente válida de datos operativos
- Los eventos cancelados o finalizados no pueden editarse
- Todo cambio relevante debe ser auditable
- La privacidad debe aplicarse por defecto según rol
- La concurrencia debe resolverse mediante bloqueo optimista
- La desactivación de clientes y productos es lógica, no física

---

## Matriz de permisos resumida

| Entidad | Dirección | Ventas | Cocina | RRHH |
|---|---|---|---|---|
| Eventos | C,R,U,D | C,R,U,D | R | R |
| Clientes | C,R,U,D | C,R,U | R parcial | Sin acceso |
| Catálogo | C,R,U,D | R | R | Sin acceso |
| Trabajadores | C,R,U,D | Sin acceso | Sin acceso | C,R,U,D |
| Cuadrantes | C,R,U | Sin acceso | Sin acceso | C,R,U |
| Incidencias | R | R | Sin acceso | Sin acceso |

---

## Modelo de datos conceptual

## Entidades principales

### usuarios
- id_usuario (UUID, PK)
- email (único)
- password_hash
- rol (`ADMIN`, `COMERCIAL`, `COCINA`, `RRHH`)
- is_active

### clientes
- id_cliente (UUID, PK)
- razon_social
- identificador_fiscal (único)
- telefono_contacto
- email
- direccion
- is_active

### eventos
- id_evento (UUID, PK)
- id_cliente (FK)
- fecha_inicio
- fecha_fin
- ubicacion
- aforo_estimado
- estado
- notas_alergias
- version
- created_at
- updated_at

### catalogo_productos
- id_plato_catalogo (UUID, PK)
- nombre
- categoria
- unidad_medida
- alergenos
- is_active

### menus_evento
Tabla puente entre evento y catálogo:
- id_menu_evento (UUID, PK)
- id_evento (FK)
- id_plato_catalogo (FK)
- cantidad_raciones
- observaciones

### trabajadores
- id_trabajador (UUID, PK)
- nombre
- telefono
- especialidad
- is_active

### cuadrantes_personal
Tabla puente entre evento y trabajador:
- id_cuadrante (UUID, PK)
- id_evento (FK)
- id_trabajador (FK)
- hora_entrada
- hora_salida

### auditoria_eventos
- id_auditoria (UUID, PK)
- id_evento
- usuario
- ip
- timestamp_utc
- campo_modificado
- valor_anterior
- valor_nuevo

### incidencias_evento
- id_incidencia (UUID, PK)
- id_evento (FK)
- descripcion
- creada_por
- created_at

---

## Reglas de integridad de datos

- `clientes.identificador_fiscal` debe ser único
- `usuarios.email` debe ser único
- Las relaciones deben proteger históricos
- No se realizan borrados físicos de negocio
- Las operaciones críticas usan transacciones
- Los conflictos concurrentes deben resolverse con control de versión
- Los solapamientos de cuadrantes deben impedir inserción

---

## Estados de evento

Estados de referencia:
- BORRADOR
- PLANIFICADO
- PREPARACION
- FINALIZADO
- CANCELADO

Reglas:
- `FINALIZADO` y `CANCELADO` => solo lectura
- `CANCELADO` excluye el evento de producción y RRHH
- `PREPARACION` entra en jurisdicción operativa de cocina
- Los cambios sobre eventos cercanos en el tiempo pueden disparar alertas

---

## Eventos críticos para automatización futura

- Alta de evento
- Modificación de aforo
- Modificación de menú
- Cancelación de evento
- Confirmación de lectura de alerta
- Asignación de trabajador
- Conflicto por solapamiento
- Cierre de evento
- Registro de incidencia
- Desactivación de producto de catálogo con impacto futuro
