---
id: HU-026
titulo: Configurar React frontend en docker-compose
epica: EP-003
prioridad: Must
complejidad: M
estado: borrador
---

# HU-026 — Configurar React frontend en docker-compose

**Como** desarrollador,
**quiero** que el frontend React esté orquestado en docker-compose,
**para** que se build y sirva junto a backend y DB.

## Fuente

PRD §10 (Frontend React, Vite, Docker orchestration).

## Criterios de Aceptación

### Escenario 1: Frontend levanta tras backend
```gherkin
Dado que ejecuto `docker-compose up -d`
Cuando se inicia el servicio frontend
Entonces espera a que backend esté listo
Y el frontend está disponible en localhost:3000
```

### Escenario 2: Frontend conecta a API
```gherkin
Dado que el frontend levanta
Cuando carga la aplicación
Entonces hace una petición a http://localhost:8000/health
Y la API responde correctamente
```

### Escenario 3: Environment apunta a backend local
```gherkin
Dado que leo las variables de entorno del container frontend
Cuando el frontend inicia
Entonces tiene VITE_API_URL=http://localhost:8000 configurada
```

### Escenario 4: Falla de conexión al backend y reintento
```gherkin
Dado que backend aún no responde en localhost:8000
Cuando frontend intenta cargar /health
Entonces muestra estado "Conectando..." o fallback UI
Y reintentos automáticos cada 2 segundos hasta conectar
```

### Escenario 5: Puerto 3000 expuesto y navegable
```gherkin
Dado que el frontend corre en docker-compose
Cuando accedo a http://localhost:3000 desde navegador host
Entonces se carga el HTML index correctamente
Y no hay errores CORS bloqueando solicitudes a localhost:8000
```
