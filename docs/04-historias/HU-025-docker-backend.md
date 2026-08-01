---
id: HU-025
titulo: Configurar FastAPI backend en docker-compose
epica: EP-001
prioridad: Must
complejidad: M
estado: borrador
---

# HU-025 — Configurar FastAPI backend en docker-compose

**Como** desarrollador,
**quiero** que el backend FastAPI esté orquestado en docker-compose,
**para** que levante con su dependencia en PostgreSQL.

## Fuente

PRD §10 (FastAPI backend, Docker orchestration).

## Criterios de Aceptación

### Escenario 1: Backend levanta tras DB
```gherkin
Dado que ejecuto `docker-compose up -d`
Cuando se inicia el servicio backend
Entonces espera a que postgres esté listo
Y el backend está disponible en localhost:8000
```

### Escenario 2: Backend conecta a BD
```gherkin
Dado que el backend levanta
Cuando hago GET /health
Entonces retorna {status: "ok", db: "connected"}
```

### Escenario 3: Environment variables configuradas
```gherkin
Dado que leo las variables de entorno del container
Cuando el backend inicia
Entonces tiene DATABASE_URL, JWT_SECRET_KEY, DEBUG=false configuradas
```

### Escenario 4: Falla de conexión a BD y reintentos
```gherkin
Dado que postgres aún no responde
Cuando el backend intenta conectarse en startup
Entonces reintentos automáticos hasta timeout configurable
Y el log muestra el número de intentos y duración de espera
```

### Escenario 5: Puerto 8000 expuesto y accesible
```gherkin
Dado que el backend corre en docker-compose
Cuando verifico con `curl http://localhost:8000/health` desde host
Entonces la respuesta es {status: "ok"} con status 200
Y la conexión establece desde fuera del container
```
