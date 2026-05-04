## Visión general técnica

La solución propuesta para **Catering Sabores de Casa** es una plataforma web interna basada en una arquitectura de **tres capas**:

1. **Frontend SPA**
2. **Backend API REST**
3. **Base de datos relacional**

Objetivo técnico:
- Centralizar operaciones
- Garantizar integridad relacional
- Aplicar RBAC desde servidor
- Soportar concurrencia
- Mantener costes controlados con stack open source

---

## Arquitectura general

## Capas del sistema

### 1. Capa de presentación
Aplicación web SPA desarrollada en **Angular**.

Responsabilidades:
- Renderizado de interfaz
- Routing
- Guards de navegación
- Formularios reactivos
- Consumo de API REST
- Visualización en tiempo real de alertas
- Adaptación responsive a escritorio y tablet

### 2. Capa de lógica de negocio
API REST desarrollada en **Node.js + Express.js**.

Responsabilidades:
- Autenticación JWT
- Autorización por roles
- Validaciones de negocio
- Gestión de transacciones
- Auditoría
- Integración con PostgreSQL
- Emisión de alertas en tiempo real

### 3. Capa de persistencia
**PostgreSQL** como base de datos relacional.

Responsabilidades:
- Integridad referencial
- Transacciones ACID
- Consultas agregadas
- Persistencia de históricos
- Control de concurrencia y consistencia

---

## Principios arquitectónicos

- Separación de responsabilidades
- Cliente-servidor
- MVC / modularidad por dominios
- Clean Architecture en backend
- Tipado fuerte con TypeScript
- Open Source first
- Escalabilidad incremental
- Seguridad validada en backend, no solo en frontend

---

## Stack tecnológico seleccionado

## Frontend
- Angular
- TypeScript
- HTML5
- SCSS
- Bootstrap 5
- RxJS

## Backend
- Node.js
- Express.js
- TypeScript
- Joi o Zod para validación
- Bcrypt para contraseñas
- JWT para autenticación
- WebSockets o SSE para alertas en tiempo real

## Base de datos
- PostgreSQL

## Testing / QA
- Jest
- Jasmine / Karma
- Supertest
- Cypress
- Postman / Newman
- K6 o Apache JMeter

## Infraestructura / DevOps
- Docker
- Docker Compose
- Git
- CI/CD con GitHub Actions o GitLab CI
- Nginx para servir frontend
- Cloud de bajo coste: AWS / Render / similar

---

## Arquitectura de frontend Angular

## Estructura recomendada

### Core Module
Contiene servicios singleton:
- AuthService
- TokenInterceptor
- Guards
- Error handler global
- Servicios de sesión

### Shared Module
Componentes reutilizables:
- Tablas
- Modales
- Botones
- Pipes
- Componentes de formulario
- Layouts reutilizables

### Auth Module
- Login
- Logout
- Gestión de sesión
- Recuperación futura de credenciales

### Feature Modules
Separación por dominio:
- ComercialModule
- ProduccionModule
- TalentoModule
- CatalogoModule
- HistorialModule
- OperacionesModule

---

## Patrones de frontend

### Smart / Dumb components
- Smart components: orquestan llamadas a servicios y estado
- Dumb components: renderizan datos y emiten eventos

### Reactive Forms
Usar formularios reactivos para:
- alta de eventos
- edición de menú
- alta de clientes
- alta de catálogo
- asignación de personal

### Lazy Loading
Cargar módulos bajo demanda para:
- reducir tiempo de carga inicial
- aislar contextos funcionales
- mejorar mantenibilidad

### RxJS
Usar observables para:
- consumo de API
- filtros reactivos
- búsqueda con debounce
- actualización de alertas tiempo real

---

## Seguridad en frontend

### Guards
Usar `CanActivate` y, si aplica, `CanMatch` para bloquear rutas por rol.

Ejemplo:
- Cocina no accede a rutas de clientes
- Comercial no accede a RRHH
- Usuarios sin token son redirigidos a login

### Control visual por rol
Usar directivas o helpers para ocultar/destruir del DOM:
- botones de editar
- acciones destructivas
- módulos no permitidos

Nota:
- El frontend mejora UX, pero **no sustituye** la seguridad real del backend.

---

## Arquitectura de backend Node.js + Express

## Objetivo
Construir una API RESTful stateless, mantenible, segura y validable en CI.

## Estructura sugerida

```txt
/src
  /config
  /middlewares
  /routes
  /controllers
  /services
  /repositories
  /models
  /utils
  /events
  /validators
```text

### `/config`
- variables de entorno
- conexión a PostgreSQL
- configuración JWT
- configuración CORS
- rate limit

### `/middlewares`
- verifyToken
- requireRole
- errorHandler
- requestLogger
- validateSchema
- rateLimiter

### `/routes`
Definición semántica de endpoints:
- `/api/v1/auth`
- `/api/v1/eventos`
- `/api/v1/clientes`
- `/api/v1/catalogo`
- `/api/v1/cuadrantes`
- `/api/v1/produccion`
- `/api/v1/historicos`

### `/controllers`
Responsables de:
- extraer params
- validar input superficial
- invocar services
- mapear respuestas HTTP

### `/services`
Corazón de negocio:
- alta de evento
- cambio de estado
- modificación de menú
- cálculo de alertas <48h
- validación de solapamientos
- cálculo de ratios RRHH
- cancelación con liberación de recursos
- auditoría

### `/repositories`
Acceso a datos:
- consultas SQL parametrizadas
- o uso de ORM ligero como Prisma / TypeORM

### `/events`
Mecanismos internos para disparar:
- alertas de cocina
- notificaciones operativas
- hooks de auditoría

---

## Node.js

## Motivos de selección
- Excelente para I/O intensivo
- Buen manejo de concurrencia
- Ecosistema maduro
- Misma familia tecnológica que frontend
- Bajo coste de entrada
- Integración natural con tiempo real

## Recomendaciones
- TypeScript obligatorio
- Manejo centralizado de errores
- No mezclar lógica HTTP con lógica de negocio
- No acceder a base de datos desde controladores directamente
- Usar variables de entorno para secretos

---

## Express.js

## Papel en la solución
Express será el framework HTTP principal para:
- routing REST
- middlewares
- autenticación
- validación
- serialización JSON
- control de errores

## Buenas prácticas
- versionar rutas (`/api/v1`)
- usar middlewares por responsabilidad
- respuestas consistentes
- HTTP status semánticos:
  - `200 OK`
  - `201 Created`
  - `400 Bad Request`
  - `401 Unauthorized`
  - `403 Forbidden`
  - `404 Not Found`
  - `409 Conflict`
  - `429 Too Many Requests`
  - `500 Internal Server Error`

---

## PostgreSQL

## Motivos de selección
- Cumplimiento ACID
- Integridad relacional
- Soporte transaccional sólido
- Consultas agregadas potentes
- Fiabilidad para datos críticos de negocio

## Diseño lógico principal

### Tablas críticas
- `usuarios`
- `clientes`
- `eventos`
- `catalogo_productos`
- `menus_evento`
- `trabajadores`
- `cuadrantes_personal`
- `auditoria_eventos`
- `incidencias_evento`

## Reglas de modelado
- UUID como PK
- Foreign Keys estrictas
- Soft delete para clientes y catálogo
- Índices en campos de búsqueda y filtros
- `version` para optimistic locking
- timestamps en UTC

## Índices recomendados
- `clientes.identificador_fiscal`
- `usuarios.email`
- `eventos.fecha_inicio`
- `eventos.estado`
- `menus_evento.id_evento`
- `cuadrantes_personal.id_trabajador`
- índices compuestos para búsquedas frecuentes

---

## Transacciones y consistencia

Las operaciones críticas deben ejecutarse dentro de transacciones PostgreSQL:

### Casos típicos
- alta completa de evento + líneas de menú
- cancelación de evento + liberación de recursos
- asignación de trabajador + validación de colisión
- cambio de estado + auditoría
- modificación de menú + registro de trazabilidad + trigger de alerta

### Reglas
- `BEGIN`
- ejecutar operaciones
- `COMMIT` si todo va bien
- `ROLLBACK` si falla cualquier paso

---

## Control de concurrencia

## Optimistic locking
Se recomienda un campo `version` en tablas críticas como `eventos`.

Comportamiento:
- dos usuarios cargan el mismo evento
- uno guarda primero
- el segundo intenta guardar con versión antigua
- el backend rechaza con `409 Conflict`

Objetivo:
- evitar sobreescrituras silenciosas

---

## API REST

## Dominios principales
- Auth
- Eventos
- Clientes
- Catálogo
- Producción
- RRHH / Cuadrantes
- Históricos
- Incidencias

## Ejemplos de endpoints

### Auth
- `POST /api/v1/auth/login`

### Eventos
- `GET /api/v1/eventos`
- `POST /api/v1/eventos`
- `GET /api/v1/eventos/:id`
- `PUT /api/v1/eventos/:id`
- `PUT /api/v1/eventos/:id/menus`
- `POST /api/v1/eventos/:id/cancelar`
- `POST /api/v1/eventos/:id/cerrar`

### Clientes
- `GET /api/v1/clientes`
- `POST /api/v1/clientes`
- `PUT /api/v1/clientes/:id`
- `PATCH /api/v1/clientes/:id/desactivar`

### Catálogo
- `GET /api/v1/catalogo`
- `POST /api/v1/catalogo`
- `PUT /api/v1/catalogo/:id`
- `PATCH /api/v1/catalogo/:id/desactivar`

### Producción
- `GET /api/v1/produccion/semanal`

### RRHH
- `GET /api/v1/cuadrantes`
- `POST /api/v1/cuadrantes`
- `DELETE /api/v1/cuadrantes/:id`

### Históricos
- `GET /api/v1/historicos/eventos`
- `GET /api/v1/historicos/eventos/export`

---

## Autenticación y autorización

## JWT
Modelo stateless basado en token firmado.

Flujo:
1. login con email y password
2. backend valida hash con Bcrypt
3. backend emite JWT con:
   - userId
   - rol
   - expiración
4. frontend lo envía en `Authorization: Bearer <token>`

## Reglas
- expiración controlada
- cierre por inactividad en frontend
- validación del token en cada request protegida
- RBAC validado en backend siempre

---

## Seguridad técnica

## Medidas obligatorias
- HTTPS / TLS
- CORS restringido
- Rate limiting en login y endpoints críticos
- Sanitización / prevención de XSS
- SQL parametrizado / ORM seguro
- Contraseñas con Bcrypt
- No exponer datos sensibles por rol
- Logs de auditoría
- Separación de secretos por entorno

## Riesgos identificados
- elevación de privilegios
- colisiones concurrentes
- latencia en exteriores
- ataques de fuerza bruta
- modificaciones tardías sin respuesta operativa

---

## Tiempo real

## Casos de uso
- alertas a cocina por cambios <48h
- notificaciones de incidencias
- eventos operativos importantes

## Tecnología sugerida
- WebSockets como opción principal
- SSE como alternativa simple para notificaciones unidireccionales

---

## Rendimiento

## Objetivos
- lecturas comunes < 500 ms según RNF
- soporte mínimo para 150 usuarios concurrentes
- respuesta estable sin degradación significativa

## Estrategias
- connection pooling PostgreSQL
- paginación en servidor
- consultas optimizadas
- índices
- lazy loading en frontend
- evitar payloads excesivos
- debounce en buscadores
- caché puntual si fuera necesario

---

## Resiliencia y operación en campo

Debido a posibles problemas de red en fincas o exteriores:

### Recomendación
Implementar en frontend:
- Service Workers
- cache de resumen operativo del día
- lectura offline básica para contingencia en sala

---

## Despliegue e infraestructura

## Contenedores
Usar:
- un contenedor para frontend Angular servido con Nginx
- un contenedor para backend Node.js
- un contenedor para PostgreSQL
- orquestación inicial con Docker Compose

## Entornos
- DEV
- STAGING / QA / UAT
- PROD

## CI/CD
Pipeline mínimo:
1. lint
2. build
3. unit tests
4. integration tests
5. bloqueo de merge si falla alguna etapa

---

## Reglas técnicas clave para la IA

- Backend en TypeScript con Express
- Frontend en Angular con módulos por dominio
- PostgreSQL obligatorio
- Soft delete en entidades maestras
- JWT + RBAC en backend
- Auditoría obligatoria en cambios críticos
- Eventos y menús deben ser transaccionales
- Solapamientos de personal deben validarse en backend
- Conflictos concurrentes devuelven `409 Conflict`
- Prohibido texto libre en menús del evento
- Cocina solo accede a vistas de lectura operativa
- Toda fecha persistida en UTC
