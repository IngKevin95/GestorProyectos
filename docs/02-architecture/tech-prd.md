---
status: "Ready for Build"
last_updated: "2026-07-31"
---

# Technical PRD: Gestor de Proyectos Aztec (MVP Completo)

Este documento actúa como el contrato técnico (`docs/02-architecture/tech-prd.md`) que consumirá la fábrica de construcción. Consolida el discovery y la arquitectura en requerimientos accionables para desarrollo.

## 1. Componentes y Capas (Architecture)
- **Capa Determinista (Motor de Riesgo y Cálculo de Prioridad)**:
  Lógica matemática central: Cálculo de la salud de proyectos y tareas (evaluada vía Cron y triggers SQL). Motor polimórfico para asignar prioridades relativas, absolutas o mixtas. Renderizado del estado global en frontend usando Zustand (ADR 002, 003, 007).

- **Capa de Servicios Externos (FastAPI, SSE y PostgreSQL)**:
  Ingesta asíncrona de archivos CSV (BackgroundTasks). Sincronización unidireccional en tiempo real mediante Server-Sent Events (SSE). Conexión asíncrona nativa a BD (SQLAlchemy 2.0). Empaquetado completo vía Docker Compose Single-Node (ADR 005, 006, 008, 010).

## 2. Datos Sensibles y Secretos (Discovery)
- **Categorías de Datos Sensibles (Credenciales de Usuario)**:
  Contraseñas de acceso requeridas por el sistema Full Auth. Deben ser hasheadas de manera irreversible usando Argon2id (ADR 004).

- **Secretos Server-Side (Claves de Configuración)**:
  `DATABASE_URL` (cadena de conexión de PostgreSQL).
  `JWT_SECRET_KEY` (llave criptográfica para firmas de tokens de sesión).

## 3. Decisiones Críticas (ADRs)
- **Decisiones de Alto Impacto (Arquitectura Definitiva)**:
  - **ADR-001 / ADR-002**: Backend en FastAPI, Frontend SPA en React 18 + Vite + Zustand.
  - **ADR-003**: Motor de salud persistido en BD (triggers) evaluado parcialmente por un Cron Job diario.
  - **ADR-004**: Autenticación estricta con JWT y Argon2id.
  - **ADR-005**: SSE nativo sin fallback de Polling (Restricción 24h).
  - **ADR-006**: Carga de CSV asíncrona con BackgroundTasks, limpieza segura y carga parcial (sin rollback global).
  - **ADR-007**: Motor de prioridad mediante patrón Strategy (configurable en UI).
  - **ADR-008**: PostgreSQL + SQLAlchemy 2.0 (Async).
  - **ADR-009 / ADR-010**: Vanilla CSS exclusivo. Infra en Docker Compose.

## 4. Diseño e Interfaz
- **Fuente de Diseño (Estética Premium y Vanilla CSS)**:
  Diseño dictado por el requisito de impresionar al usuario final ("WOW factor"). Se exige uso exclusivo de Vanilla CSS (ADR-009) con CSS custom properties para tokens de diseño — micro-animaciones, hover effects, paletas HSL y glassmorphism. Queda bloqueado el uso de librerías CSS prefabricadas (MUI/Tailwind) para garantizar el control granular de las interfaces dinámicas.
  
  **Nota:** PRD §12 fue actualizado (2026-08-01) para alinear "Utility-first Tailwind CSS" con esta decisión técnica de Vanilla CSS. Véase `docs/02-architecture/design-css.md` para la implementación detallada de design tokens y estructura CSS modular.

## 5. Observabilidad y Monitoreo
- **Logging Estructurado (JSON)**:
  Backend emite logs estructurados en formato JSON (contextualizados por request ID, usuario, endpoint). Captura: timestamp (ISO 8601), nivel (DEBUG/INFO/WARNING/ERROR), servicio (FastAPI), mensaje y contexto operativo (usuario_id, proyecto_id, duración). Almacenamiento rotativo en `logs/` local durante desarrollo; pipeline ELK o CloudWatch en producción (integración futura).

- **Métricas Prometheus**:
  Endpoint `/metrics` expone contadores y histogramas:
  - `http_requests_total{method, endpoint, status}`: totales de requests.
  - `http_request_duration_seconds{endpoint}`: latencia de endpoints.
  - `db_query_duration_seconds{operation}`: latencia de consultas (SELECT, INSERT, UPDATE).
  - `csv_import_records_processed{status}`: tareas procesadas (exitosas/fallidas) en carga CSV.
  - `priority_engine_calculations`: ejecuciones del motor de prioridad y duración.
  Scrape interval: 15s. Almacenamiento local en Prometheus para debugging (sin garantía de largo plazo en MVP).

- **Tracing Distribuido (APM Básico)**:
  Frontend captura errores no capturados e información de performance (Core Web Vitals: LCP, FID, CLS) vía `navigator.sendBeacon()` a un endpoint APM del backend. Backend instrumenta FastAPI para trazar:
  - Inicio/fin de requests HTTP.
  - Tiempo en capas: validación, lógica de negocio, queries DB, serialización.
  - Errores no controlados (stack trace + contexto de request).
  Almacenamiento local en `logs/traces/` para análisis manual (sin UI de visualización en MVP).

- **Health Checks**:
  Endpoint `GET /health` retorna `{"status": "ok", "db": "connected", "timestamp": "ISO8601"}`. Usado por orquestador (Docker Compose) para detectar fallos de servicio. Intervalo: 30s.
