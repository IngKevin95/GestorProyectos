## 1. Backend: Base de Datos y Modelos

- [ ] 1.1 Crear migración de Alembic para añadir columnas `priority_strategy` (enum/string), `priority_constant` (numeric), y `business_value` (numeric) a la tabla `projects`.
- [ ] 1.2 Actualizar el modelo SQLAlchemy `Project` en `db_models.py` con los nuevos campos y sus valores predeterminados (estrategia relativa).
- [ ] 1.3 Actualizar esquemas de Pydantic (`schemas.py`) `ProjectCreate`, `ProjectUpdate`, y `ProjectResponse` para incluir la configuración de prioridad y el campo `score` (solo lectura).

## 2. Backend: Lógica de Negocio y Endpoints

- [ ] 2.1 Implementar `PriorityScoringService` con la lógica polimórfica (Estrategias: Relativa, Absoluta, Mixta).
- [ ] 2.2 Integrar el cálculo de score en `GET /api/projects` y ordenar los resultados de forma descendente por el `score` y nombre como desempate.
- [ ] 2.3 Añadir pruebas unitarias y de integración para el cálculo de scores y el ordenamiento en el router.

## 3. Frontend: Componentes Base y API

- [ ] 3.1 Actualizar interfaces de TypeScript para que reflejen los nuevos campos (`health_status`, `score`, `priority_strategy`, `priority_constant`, `business_value`).
- [ ] 3.2 Crear componente reutilizable `HealthBadge` (rojo/bloqueado, ámbar/riesgo, gris/sin rumbo, verde/ok).
- [ ] 3.3 Crear componente explicativo `PriorityCriteriaPanel` que detalle la fórmula de priorización.

## 4. Frontend: Vistas y Formularios

- [ ] 4.1 Construir la Vista de Cartera (Dashboard Principal) mostrando la lista/tabla de proyectos ordenados, incluyendo las insignias de salud.
- [ ] 4.2 Actualizar el formulario de creación/edición de proyectos para incluir la selección de `priority_strategy`, y mostrar dinámicamente el campo `priority_constant` solo para estrategias Absoluta o Mixta.
- [ ] 4.3 Añadir el campo de entrada para `business_value` (valor de negocio) en el formulario de proyecto.

## 5. Pruebas End-to-End e Infraestructura

- [ ] 5.1 Verificar que el orden en el Dashboard del Frontend refleja correctamente el orden descendente por `score`.
- [ ] 5.2 Verificar la conectividad del frontend en Docker (`docker-compose.yml`) asegurando que el build de Vite y el ruteo local funcionen correctamente.
