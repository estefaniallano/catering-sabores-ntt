# 03-plan-qa.md

## Objetivo del plan QA

Definir la estrategia de calidad y validación del sistema **Catering Sabores de Casa** para asegurar:

- cumplimiento de requisitos funcionales y no funcionales
- estabilidad técnica antes del go-live
- prevención de regresiones
- cobertura suficiente en backend, frontend y flujos E2E
- validación operativa por parte de usuarios clave

---

## Alcance de pruebas

## In-Scope
Deben probarse de forma exhaustiva:

- autenticación y autorización JWT/RBAC
- CRUD de clientes
- CRUD de catálogo
- CRUD de trabajadores
- CRUD de eventos
- gestión de menús por evento
- auditoría de cambios
- cancelación de eventos
- consolidado semanal de cocina
- alertas críticas por modificaciones <48h
- proyección analítica de RRHH
- asignación de cuadrantes
- validación de solapamientos
- histórico y exportación
- rendimiento básico bajo concurrencia
- resiliencia ante entradas erróneas

## Out-of-Scope
No forma parte del alcance:

- navegadores obsoletos como Internet Explorer 11
- auditoría de seguridad de la red física de la empresa
- hardware cliente específico (tablets/PC físicos)

---

## Estrategia de pruebas

La estrategia sigue una pirámide de testing:

1. **Pruebas unitarias**
2. **Pruebas de integración**
3. **Pruebas funcionales E2E**
4. **Pruebas de rendimiento y carga**
5. **UAT con usuarios clave**

---

## 1. Pruebas unitarias

## Objetivo
Validar funciones aisladas del backend y frontend.

## Herramientas
- Backend: **Jest**
- Frontend: **Jasmine / Karma**

## Responsables
- Equipo de desarrollo

## Cobertura objetivo
- mínimo **80%** de cobertura en servicios y lógica crítica

## Qué debe probarse

### Backend
- cálculo de ratios de personal
- validación de fechas
- validación de estados permitidos
- reglas de cancelación
- detección de cambios dentro de ventana de 48h
- detección de colisiones de cuadrantes
- agregaciones lógicas previas a SQL si existen
- auditoría y generación de diffs

### Frontend
- guards por rol
- renderizado condicional de botones
- formularios reactivos
- validaciones inline
- componentes de alertas
- pipes y utilidades

---

## 2. Pruebas de integración

## Objetivo
Validar la interacción correcta entre:
- rutas
- controladores
- servicios
- repositorios
- base de datos

## Herramientas
- **Supertest**
- **Postman**
- **Newman** para automatización

## Responsables
- QA técnico

## Qué debe comprobarse
- códigos HTTP correctos
- payloads JSON correctos
- persistencia real en BBDD
- rollbacks en transacciones fallidas
- restricciones de permisos
- errores controlados
- conflictos `409`
- rechazos `401` y `403`
- rate limiting `429`

---

## 3. Pruebas funcionales E2E

## Objetivo
Simular la interacción real del usuario en la interfaz.

## Herramientas
- **Cypress**
- pruebas exploratorias manuales

## Responsables
- QA funcional

## Cobertura
- login
- navegación por módulos
- flujos completos de creación y modificación
- validaciones visuales
- bloqueo de acciones por estado
- recepción de notificaciones push
- interacción por rol

---

## 4. Pruebas de rendimiento y carga

## Objetivo
Validar el cumplimiento de los requisitos no funcionales de latencia y concurrencia.

## Herramientas
- **K6**
- o **Apache JMeter**

## Meta mínima
- sostener **150 usuarios concurrentes**
- mantener operaciones de lectura típicas por debajo de **500 ms** según documentos QA/RNF

## Escenarios prioritarios
- listado de eventos
- búsqueda de clientes
- dashboard de producción semanal
- login con control de tasa
- consultas filtradas paginadas

---

## 5. UAT - User Acceptance Testing

## Objetivo
Validar que el sistema resulta útil, entendible y operativamente correcto para negocio.

## Participantes clave
- Chef / Jefe de Cocina
- Responsable Comercial
- Gerencia / Dirección

## Duración prevista
- 3 días en preproducción

## Enfoque
- no centrado en bugs técnicos
- centrado en usabilidad, lógica operativa y adecuación al negocio

---

## Entornos de prueba

## DEV
- uso de desarrolladores
- datos volátiles
- soporte a pruebas unitarias locales

## STAGING / QA
- réplica técnica de producción
- usado para integración, E2E, rendimiento y QA funcional

## UAT
- preproducción reservada a usuarios clave del negocio

## PROD
- entorno final
- no debe utilizarse para validación experimental

---

## Datos de prueba

## Reglas
- prohibido usar datos reales en entornos inferiores a UAT si comprometen GDPR
- usar datos sintéticos o anonimizados

## Recomendación
Sembrar STAGING con:
- hasta 10.000 registros ficticios
- clientes ficticios
- eventos de prueba
- trabajadores simulados

## Herramientas
- Faker.js o equivalente

---

## Casos de prueba críticos

## CP-01 Autenticación y autorización RBAC
### Objetivo
Validar que cada rol solo accede a lo permitido.

### Escenario
- login con usuario Cocina
- intento de acceso a una ruta restringida

### Resultado esperado
- JWT correcto al autenticar
- bloqueo por guard/frontend
- rechazo por backend si se fuerza acceso
- mensaje de error o redirección controlada

---

## CP-02 Creación de evento y validación de entradas
### Objetivo
Asegurar integridad de datos en alta de servicio.

### Validaciones mínimas
- cliente obligatorio
- fecha futura
- horas coherentes
- guardado correcto con `201 Created`

---

## CP-03 Rollback transaccional
### Objetivo
Validar que no queden eventos huérfanos si falla la persistencia del menú.

### Resultado esperado
- rollback completo
- no debe existir la cabecera si falla el detalle

---

## CP-04 Alerta de modificación urgente en cocina
### Objetivo
Validar disparo de alertas por cambios a menos de 48h.

### Resultado esperado
- cocina recibe banner en tiempo real sin recargar
- alerta persistente hasta confirmación

---

## CP-05 Prevención de solapamiento de cuadrantes
### Objetivo
Validar conflicto de agenda laboral.

### Resultado esperado
- API devuelve `409 Conflict`
- frontend informa del solapamiento existente

---

## CP-06 Consolidado semanal de producción
### Objetivo
Verificar exactitud de sumatorios agregados.

### Resultado esperado
- solo eventos válidos cuentan
- cancelados y borradores no inflan resultados

---

## CP-07 Cancelación y borrado lógico seguro
### Objetivo
Validar conservación de históricos.

### Resultado esperado
- cliente/producto desactivado no aparece en nuevos flujos
- pero sí permanece en reportes históricos

---

## CP-08 Rate limiting
### Objetivo
Validar protección ante fuerza bruta.

### Resultado esperado
- tras superar el límite, la API devuelve `429 Too Many Requests`

---

## Casos adicionales recomendados

## Concurrencia sobre evento
- dos comerciales editan el mismo evento
- el segundo guardado debe fallar con `409 Conflict`

## Bloqueo por estado final
- intentar modificar evento `FINALIZADO`
- el sistema debe impedirlo en frontend y backend

## Restricción de menú libre
- intentar persistir una línea de menú no existente en catálogo
- debe rechazarse

## Descatalogación con impacto futuro
- descatalogar un plato usado en eventos futuros
- debe generarse warning controlado

## Cierre de evento antes de la fecha
- intento de cerrar evento antes de ejecutarse
- backend debe rechazar

## Exportación histórica
- validar filtros, contenido del CSV y consistencia de columnas

## Sesión expirada
- validar logout por inactividad
- asegurar rechazo de token expirado

---

## Niveles de severidad de defectos

### Blocker
Interrumpe un flujo crítico sin alternativa.
Ejemplos:
- error 500 al guardar evento
- login inoperativo
- corrupción transaccional

### High
Impacto grave con workaround temporal.
Ejemplos:
- fallo al asignar personal en ciertos casos
- pérdida de alerta crítica

### Medium
Problema funcional menor o cálculo incorrecto no crítico.
Ejemplos:
- validación incompleta
- redondeo erróneo en ratios

### Low
Errores visuales o cosméticos.
Ejemplos:
- CSS
- textos desalineados
- copy incorrecto

---

## Flujo de gestión de defectos

Estados recomendados:
1. Nuevo
2. Asignado
3. En progreso
4. Listo para QA
5. Resuelto
6. Reabierto si reaparece

Herramienta sugerida:
- Jira
- Trello
- Azure DevOps o equivalente

Cada bug debe incluir:
- título claro
- pasos para reproducir
- resultado actual
- resultado esperado
- evidencias
- entorno
- severidad
- versión

---

## Criterios de suspensión

La ejecución E2E debe suspenderse si:
- aparecen 2 o más defectos Blocker en la primera hora
- el entorno STAGING no es estable
- login o persistencia base no funcionan
- la infraestructura devuelve errores sistemáticos

---

## Criterios de cierre QA

El sistema solo será apto para despliegue si se cumple todo lo siguiente:

1. 100% de pruebas unitarias e integración en verde en CI/CD
2. 100% de casos críticos CP-01 a CP-08 superados
3. 0 defectos abiertos de severidad Blocker o High
4. UAT firmado por Dirección
5. rendimiento mínimo aceptable validado
6. sin regresiones críticas abiertas

---

## Trazabilidad QA -> negocio

Cada caso de prueba debe poder mapearse contra:
- RF de análisis funcional
- INT de interacciones
- RNF de rendimiento, seguridad y disponibilidad

Ejemplos:
- CP-01 -> RF-12, INT-16
- CP-02 -> RF-01, INT-01
- CP-04 -> RF-08, INT-04
- CP-05 -> RF-11, INT-06
- CP-06 -> RF-07, INT-03

---

## Automatización recomendada en CI/CD

Pipeline mínimo:
1. lint
2. build frontend/backend
3. unit tests backend
4. unit tests frontend
5. integration tests API
6. smoke tests E2E en staging si aplica

Bloqueos:
- no desplegar si falla cualquier prueba crítica
- no permitir merge con regresiones abiertas de alta severidad

---

## Reglas QA clave para la IA

- Toda funcionalidad crítica debe tener cobertura unitaria e integración
- Eventos y menús requieren pruebas transaccionales
- Cambios <48h requieren prueba de alerta en tiempo real
- RBAC debe validarse en frontend y obligatoriamente en backend
- Solapamientos de personal deben probarse con conflicto real
- Históricos nunca deben romperse por soft delete
- `FINALIZADO` y `CANCELADO` deben comportarse como solo lectura
- El sistema debe responder con HTTP semántico
- Rendimiento y concurrencia son parte del alcance, no opcionales
