---
id: HU-024
titulo: Configurar PostgreSQL 15 en docker-compose
epica: EP-001
prioridad: Must
complejidad: S
estado: borrador
---

# HU-024 — Configurar PostgreSQL 15 en docker-compose

**Como** desarrollador,
**quiero** que la base de datos PostgreSQL 15 esté orquestada en docker-compose,
**para** que levante automáticamente sin depender de una instalación local.

## Fuente

PRD §10 (Requisitos Técnicos: PostgreSQL 15+, Docker + docker-compose).

## Criterios de Aceptación

### Escenario 1: docker-compose levanta PostgreSQL
```gherkin
Dado que ejecuto `docker-compose up -d`
Cuando el servicio postgres inicia
Entonces está disponible en localhost:5432
Y acepta conexiones con credenciales por defecto
```

### Escenario 2: Base de datos se crea automáticamente
```gherkin
Dado que postgres inicia por primera vez
Cuando se ejecutan los scripts de inicialización
Entonces la BD "gestor_proyectos" se crea
Y las tablas (projects, tasks, team, audit_log) existen
```

### Escenario 3: Volumen persiste datos
```gherkin
Dado que creo una tabla de prueba en postgres
Cuando hago `docker-compose down` y `docker-compose up`
Entonces los datos de la tabla persisten
```

### Escenario 4: Falla de conexión y reintento
```gherkin
Dado que postgres aún no está listo al iniciar docker-compose
Cuando el backend intenta conectarse
Entonces reintentos exponenciales hasta conectar exitosamente
Y el log registra los intentos de reconexión
```

### Escenario 5: Variables de entorno y credenciales
```gherkin
Dado que docker-compose carga desde archivo .env
Cuando se inician los contenedores
Entonces POSTGRES_PASSWORD no aparece en logs ni en docker inspect
Y las credenciales se cargan desde variables de entorno, no hardcodeadas
```
