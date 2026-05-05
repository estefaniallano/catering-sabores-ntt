# Catering Sabores de Casa - Sistema Centralizado de Planificación

## Descripción del Proyecto
Plataforma web B2B de uso interno diseñada para centralizar la gestión operativa de Catering Sabores de Casa. Este sistema unifica los flujos de trabajo de los departamentos de Ventas, Producción (Cocina) y Recursos Humanos, eliminando la dependencia de hojas de cálculo descentralizadas.

## Stack Tecnológico
- Frontend: Angular, TypeScript, SCSS, Bootstrap 5.
- Backend: Node.js, Express.js, TypeScript.
- Base de Datos: PostgreSQL.
- Testing: Jest para el backend y Cypress para las pruebas funcionales.

## Estructura del Repositorio
- /frontend: Contiene la interfaz de usuario (SPA) y las vistas de la demo (Login, Comercial, Cocina).
- /backend: Contiene la API RESTful, los controladores, servicios y las pruebas unitarias.
- /database: Contiene el script SQL para inicializar las tablas.
- /memory-bank: Archivos Markdown con las reglas de negocio, el plan de QA y el stack técnico.
- /evidencias: Capturas de pantalla que demuestran el funcionamiento de la interfaz y la ejecución exitosa de los tests unitarios.

## Instrucciones de Instalación y Ejecución

### 1. Preparar el Backend
Desde la raíz del proyecto, abre una terminal y ejecuta los siguientes comandos para instalar las dependencias y levantar el servidor:
cd backend
npm install
npm run dev

### 2. Preparar el Frontend
Abre una nueva terminal y ejecuta los siguientes comandos para instalar las librerías de la interfaz y levantar el entorno de desarrollo:
cd frontend
npm install
npm start

La aplicación estará disponible en tu navegador en http://localhost:4200.

### 3. Ejecutar los Tests Unitarios
Para verificar la calidad lógica del código del servidor, abre una terminal en la carpeta del backend y ejecuta:
npm test
