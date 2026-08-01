---
id: HU-027
titulo: Orquestar stack completo en docker-compose
epica: EP-000
prioridad: Must
complejidad: M
estado: lista
dependencias: [HU-024, HU-025, HU-026]
---

# HU-027 — Orquestar stack completo en docker-compose

**Como** desarrollador,
**quiero** que `docker-compose up` levante el stack entero (DB + Backend + Frontend),
**para** tener un ambiente reproducible con un solo comando.

## Fuente

PRD §12 (AC Globales: "Sistema levanta localmente mediante `docker-compose up`").

## Criterios de Aceptación

### Escenario 1: docker-compose.yml orquesta 3 servicios
```gherkin
Dado que tengo un docker-compose.yml en la raíz del proyecto
Cuando ejecuto `docker-compose up -d`
Entonces se inician 3 servicios en orden: postgres, backend, frontend
Y todos llegan a estado "healthy" o "running"
```

### Escenario 2: Stack completo accesible
```gherkin
Dado que todos los servicios levantaron
Cuando intento acceder a:
  - http://localhost:3000 (frontend)
  - http://localhost:8000/health (backend)
  - localhost:5432 (postgres)
Entonces todos responden sin error
```

### Escenario 3: Datos semilla se cargan automáticamente
```gherkin
Dado que ejecuto `docker-compose up`
Cuando todos los servicios están listos
Y he configurado SEED_DATA=true
Entonces la BD contiene proyectos y tareas de ejemplo
Y el frontend muestra la cartera con datos
```

### Escenario 4: docker-compose down limpia todo
```gherkin
Dado que el stack está corriendo
Cuando ejecuto `docker-compose down -v`
Entonces todos los containers se detienen
Y el volumen de datos se elimina (opcionalmente)
```

### Escenario 5: Falla de uno de los servicios en startup
```gherkin
Dado que uno de los servicios (ej: backend) falla en iniciar
Cuando ejecuto `docker-compose up`
Entonces los logs muestran claramente cuál servicio falló
Y los otros servicios no se quedan en estado "waiting" indefinidamente
Y puedo ejecutar `docker-compose logs backend` para diagnosticar
```
