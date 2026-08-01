---
id: PRD-001
titulo: GestorProyectos — Sistema de gestión de proyectos operativo (Reto Aztec)
estado: borrador
fecha: 2026-08-01
stakeholders: [Kevin]
---

# PRD — GestorProyectos

## 1. Introducción y Problema
Aztec opera múltiples proyectos simultáneos (consultoría, automatización, mantenimiento recurrente) para distintos clientes, con un equipo de delivery compartido. 
**Problema:** La información vive dispersa en planillas (CSV). No hay una vista única que indique rápidamente el estado real de la cartera (qué proyecto está en riesgo, bloqueado o sin rumbo) ni qué debería atenderse primero.

## 2. Audiencia y Stakeholders
- **Stakeholder principal**: Kevin (dueño de producto, desarrollador). Decide alcance y prioridad.
- **Usuario final (simulado)**: Delivery Lead en Aztec. Gestiona la cartera de proyectos y requiere saber dónde enfocar la atención diaria.
- **Evaluador (Aztec)**: Consumidor del prototipo final. Evalúa el criterio de priorización y la funcionalidad de la demo.

## 3. Casos de Uso e Historias de Usuario
- Como Delivery Lead, quiero crear y actualizar proyectos (responsable, estado, prioridad, fecha límite, siguiente paso, bloqueos, notas) para mantener el estado real.
- Como Delivery Lead, quiero que el sistema marque automáticamente proyectos en riesgo, bloqueados o sin siguiente paso claro.
- Como Delivery Lead, quiero una vista de seguimiento operativo ordenada por prioridad.
- Como Delivery Lead, quiero entender el criterio de priorización aplicado.
- Como Delivery Lead, quiero ver las tareas de un proyecto para entender su estado.
- Como Administrador, quiero gestionar usuarios, roles y configuración base.
- Como Auditor, quiero un registro de cambios (Audit Trail) de cada proyecto.

## 4. Componentes Principales / Sitemap

**Pantallas Must-have (MVP):**
- **Dashboard / Vista de Cartera**: listado de proyectos con badges de salud, filtros, ordenamiento por score.
- **Detalle de Proyecto**: visualización y edición de campos operativos (responsable, estado, prioridad, fecha límite, siguiente paso, bloqueos, notas, tipo de proyecto).
- **Vista de Tareas**: listado de tareas asociadas a un proyecto, filtrable por estado (abierta, vencida, bloqueada).
- **Panel de Priorización**: panel explicativo mostrando el criterio y pesos del score de priorización.
- **Login**: pantalla de autenticación JWT.

**Pantallas Should-have:**
- **TeamCapacityPage**: tabla de carga de trabajo por miembro del equipo.
- **AdminPage**: gestión de usuarios y roles.
- **AuditTrail**: historial de cambios de cada proyecto.
- **TemplatesPage**: CRUD de plantillas de proyectos.

**Pantallas Out-of-scope:**
- Configurador visual de criterio de priorización.
- Reportes históricos o exportación de datos.

---

## 5. Objetivos y KPIs

**Objetivo principal:** Construir un prototipo funcional de gestión de proyectos (24h) que centralice datos, detecte riesgos automáticamente y ofrezca priorización explícita.

**KPIs (Cuantitativos — Medición Post-Lanzamiento):**
1. **Adopción:** X% de Delivery Leads en Aztec usan el sistema en su 2.ª semana (objetivo: >60%).
2. **Eficiencia operativa:** Tiempo promedio de identificación de proyecto en riesgo <30 segundos (baseline: CSV manual ~5 min). Medida con telemetría de sesión.
3. **Satisfacción:** NPS ≥40 en encuesta a stakeholders de Aztec tras 1 mes.
4. **Retención:** Uso activo semanal ≥80% de usuarios tras 30 días (login ≥1x/semana).
5. **Completitud de datos:** Campos operativos rellenados en ≥95% de proyectos activos (sin nulls en must-have).
6. **Explicabilidad del criterio:** >90% de stakeholders comprenden el criterio de priorización en demostración en vivo sin documentación técnica (validado en entrevista post-demo).

## 6. Funcionalidades (In Scope)
**Must-have (Demo MVP):**
- CRUD de Proyectos con campos operativos: responsable, estado, prioridad, fecha límite, siguiente paso, bloqueos, notas, **tipo de proyecto** (enum: Mantenimiento, Recurrente, Diagnóstico, Proyecto).
- CRUD de Tareas asociadas a proyectos.
- Motor de salud automático: 
  - Bloqueado: si `blockers` no vacío o `overdue_tasks >= 3` o `blocked_tasks > 0`.
  - Riesgo: `target_date <= 7 días` con tareas abiertas (>0).
  - Sin rumbo: `siguiente paso` vacío.
- Score de priorización (Motor Polimórfico configurable). Pesos por defecto: Salud (30%), Urgencia (25%), Valor (25%), Tareas Críticas (20%).
- Dashboard: Vista de cartera filtrable y ordenada por score.
- Autenticación JWT y roles básicos.
- Carga semilla inicial (fallback de ignorar filas corruptas y reportar vía SSE).

**Should-have:**
- TeamCapacityPage (carga por miembro).
- Historial de cambios (Audit Trail).
- Templates (Plantillas base de proyectos).

## 7. Fuera de Alcance (Out of Scope)

### Arquitectura y Multitenancia
- Soporte para múltiples tenants aislados con datos completos (single-tenant esta iteración).
- Segregación de espacios de trabajo por equipo o cliente.

### Integraciones Externas
- Integración bidireccional en tiempo real con APIs de Aztec (solo ingesta CSV unidireccional).
- Alertas automáticas externas (Slack, Email, Teams).
- Sincronización con sistemas de calendario (Google Calendar, Outlook).
- Push notifications nativas.

### Análisis y Reportería
- Reportes históricos o de tendencias a largo plazo.
- Exportación bulk de datos (CSV, Excel, PDF).
- Análisis predictivo de riesgo de proyectos.
- Dashboards ejecutivos o KPI tracking.

### Experiencia de Usuario
- Personalización avanzada de vistas (custom columns, saved filters).
- Aplicación móvil (solo web).
- Soporte para múltiples idiomas (solo español inicialmente).
- Temas oscuro/claro avanzados.

### Justificación General
Estos elementos requieren arquitectura más compleja (multitenancia, webhooks bidireccionales, ML) o análisis de datos post-MVP. Se consideran post-lanzamiento inicial.

## 8. Supuestos
- `engagement_type` (Mantenimiento/Diagnóstico/Proyecto) es un dato de negocio válido aunque sea taxonomía manual.
- Fechas de entrega nulas se consideran urgencia temporal 0.
- Proyectos sin tareas asumen 0 tareas vencidas.

## 9. Restricciones y Riesgos
- **Restricción de tiempo:** Entrega en 24h. Obliga a priorizar "Must-haves" estrictamente.
- **Riesgo:** Dataset CSV corrupto o malformado. **Mitigación:** Ignorar filas malformadas (sin ID o status) y loguear error (SSE), permitiendo carga parcial segura.
- **Riesgo:** Complejidad del motor de reglas. **Mitigación:** Mantener reglas deterministas (campos vacíos, fechas pasadas, contadores).

## 10. Apéndices y Recursos

### Research y Benchmarks
- **Herramientas de gestión de proyectos referentes:**
  - Jira (atlassian.com): Gestión ágil con motor de reglas customizable.
  - Monday.com: Dashboard de cartera con scoring automático.
  - Asana: Vista de timeline y dependencias entre tareas.
  - Notion: Base de datos flexible con filtros y vistas.
- **Contexto:** GestorProyectos se posiciona como versión lightweight y operativa, sin complejidad de Jira pero con detección automática de riesgos.

### Mockups / Wireframes
- **Dashboard (Vista de Cartera):** Tabla con columnas (Proyecto, Responsable, Estado, Salud, Score, FechaLímite). Orden: score desc. Filtros: Estado, Salud, Responsable.
- **Detalle de Proyecto:** Formulario con 7 campos editables inline (responsable, estado, prioridad, fecha límite, siguiente paso, bloqueos, notas) + panel lateral con salud calculada.
- **Vista de Tareas:** Tabla anidada bajo proyecto con columnas (Tarea, Estado, FechaVencida). Filtro: Estado.
- **Panel de Priorización:** 4 factores (Salud, Urgencia, Valor, Críticas) con pesos visuales (barras % o anillos). Fórmula visible: Score = 0.3×Salud + 0.25×Urgencia + 0.25×Valor + 0.2×Críticas.

### Dataset Referencia (Aztec)
- **Fuente:** Projects.csv, Tasks.csv (proporcionados por Aztec).
- **Volumen:** ~15 proyectos, ~80 tareas (estimado para demo).
- **Formato esperado:** CSV UTF-8, BOM tolerado, delimitador coma.

---

## 11. Requisitos Técnicos
- **Frontend:** React 18, TypeScript, Vite, Zustand (estado local), Tailwind CSS.
- **Backend:** FastAPI (Python).
- **Base de Datos:** PostgreSQL 15+.
- **Infraestructura:** Docker + docker-compose para setup local reproducible.
- **Protocolos:** REST para CRUD, JWT para Auth, exclusivo SSE para real-time (prohibido WebSockets y polling).

## 12. Experiencia de Usuario y Diseño

### Principios de Diseño
- **Legibilidad operativa:** Prioridad 1 = información rápida (tiempo de visibilidad <3s).
- **Estilización:** Tailwind CSS con variables de diseño (CSS custom properties). Máximo control para micro-animaciones, glassmorphism y paletas HSL. Véase ADR-009 para justificación técnica.
- **Accesibilidad WCAG AA:** Validado con axe DevTools en CI.
- **Componentes modulares simples:** Reutilización, no API compleja.

### Paleta de Colores (Referencia)
- **Verde (#10B981):** Estado "OK" / Sin riesgo.
- **Amarillo (#F59E0B):** Estado "Riesgo" (target ≤7 días).
- **Rojo (#EF4444):** Estado "Bloqueado" (tiene blockers activos).
- **Gris (#6B7280):** Estado "Sin rumbo" (siguiente paso vacío).
- **Texto primario:** #1F2937 (dark) / #F9FAFB (light) — ratio WCAG AA ≥4.5:1.
- **Fondo:** #FFFFFF (light mode) / #111827 (dark mode).

### Design Tokens (Tailwind CSS)
- **Spacing:** Multiples de 4px (`--space-xs: 4px, --space-sm: 8px, --space-md: 16px, --space-lg: 24px, --space-xl: 32px`).
- **Border Radius:** Componentes: `--radius-sm: 4px`, Cards: `--radius-md: 8px`, Buttons: `--radius-sm`.
- **Shadows:** Tarjetas: `--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)`, Hover: `--shadow-lg: 0 20px 25px rgba(0,0,0,0.1)`.
- **Tipografía:** Inter o fallback system fonts. Headings: `font-weight: 700`, Body: `font-weight: 400`. Implementado en archivo `variables.css` raíz.

### Restricciones de Marca
- **Logo Aztec:** Opcional en header (si aplica marca cliente).
- **Tipografía:** Sistema sans-serif (Inter preferred; fallback: -apple-system, BlinkMacSystemFont, sans-serif).
- **Spacing:** Múltiplos de 4px en todo (custom properties `--space-*`).

### Validación de Accesibilidad
- Antes de cada release: `npm run axe` (axe-core en tests).
- Checklist WCAG AA: https://www.w3.org/WAI/WCAG21/quickref/ (color contrast, keyboard nav, alt text).

## 12. Criterios de Aceptación Globales
- Sistema permite crear y editar proyectos con todos sus campos.
- Motor clasifica automáticamente los 3 estados (en riesgo, bloqueado, sin rumbo).
- Dashboard ordena proyectos por score de prioridad (criterio visible en UI).
- Sistema levanta localmente mediante `docker-compose up` con la carga semilla de datos.
- Datos de ejemplo reflejan variabilidad de prioridades y estados.

## 13. Planificación e Hitos

### Equipo
- **Full-stack:** Kevin (desarrollo, QA manual, infra). Sin QA dedicado en MVP.
- **Stakeholder:** Kevin (Delivery Lead simulado, validación, priorización).

### Fases y Dependencias

| Fase | Duración Est. | Bloquea | Entregables | Owner | Nota |
|------|---|---|---|---|---|
| Discovery | 2h | Tech Design, Build Core | PRD ✓, Épicas, Historias, AC, Flows | Kevin | En progreso |
| Tech Design | 2h | Build Core, Build UI | Schema DB, Componentes React, endpoints REST | Kevin | Bloquea 2 caminos |
| Build Core | 6h | Carga Semilla | Backend CRUD + motor salud/priorización | Kevin | Paralelo con Build UI (lag ≤1h) |
| Build UI | 6h | Integración | Dashboard, Detalle Proyecto, Auth | Kevin | Puede iterar sobre Build Core |
| Carga Semilla | 4h | Entrega | Script CSV → DB, fallback handling | Kevin | Requiere schema final |
| Entrega | 4h | Ninguno | Video demo, README, docker-compose ready | Kevin | QA final: app local corre sin errores |

**Total:** ~24h estimadas (incluyendo iteraciones y ajustes).

### Dependencias Críticas
- **Tech Design** debe completar antes de iniciar Build Core/Build UI (bloquea 2 caminos).
- **Build Core** parcialmente completo antes de iniciar Carga Semilla (necesita schema final).
- **Integración de Build Core + Build UI** debe validarse en "Entrega" (smoke tests en docker-compose).

### Riesgo: Paralelización
- Build Core + Build UI en paralelo con 1 dev puede generar conflictos de integración.
- **Plan B:** Serial si iteraciones son bloqueantes (Core → UI → Integración).
- **Go/No-go:** Si al final de Build Core no se puede iniciar Build UI, cambiar a plan B.
