---
id: HU-021
titulo: Integración de Webhooks básicos
epica: EP-009
prioridad: Could
complejidad: S
estado: borrador
dependencias: [HU-004, HU-005, HU-006]
---

# HU-021 — Integración de Webhooks básicos

**Como** Administrador,
**quiero** poder configurar una URL para recibir notificaciones vía webhook cuando un proyecto cambia de estado,
**para** poder integrar el gestor con herramientas externas (ej. Slack, Zapier).

## Fuente
PRD Sección 6 (Could).

## Chequeo INVEST
- **Valiosa**: ✓
- **Independiente**: ✓
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Envío de Webhook
```gherkin
Dado que hay un webhook configurado en Settings
Cuando un proyecto cambia su salud de "Ok" a "En riesgo"
Entonces el sistema envía un POST HTTP a la URL configurada con el payload del evento
```

### Escenario 2: Falla de envío del Webhook
```gherkin
Dado que hay un webhook configurado
Cuando un evento ocurre y el servidor destino responde con error 500
Entonces el sistema marca el evento de notificación como "Fallido"
Y se registra en el log interno sin bloquear el cambio de estado del proyecto
```

### Escenario 3: Reintentos automáticos
```gherkin
Dado que el primer intento de enviar un webhook falló (timeout)
Cuando el sistema reintenta automáticamente (máx 3 intentos)
Entonces en el segundo intento el servidor responde correctamente
Y el webhook se marca como "Exitoso"
Y se registra la cantidad de reintentos en el log
```

### Escenario 4: Webhook deshabilitado
```gherkin
Dado que un webhook existe pero está deshabilitado en Settings
Cuando ocurre un evento que normalmente lo dispararía
Entonces el webhook NO se envía
Y se registra en log que fue ignorado por estar deshabilitado
```

### Escenario 5: Validación de payload del webhook
```gherkin
Dado que un evento ocurre en el sistema
Cuando se construye el payload del webhook
Entonces incluye: event_type, timestamp, project_id, cambios (old_value, new_value)
Y el formato JSON es válido
Y se puede parsear correctamente en sistemas receptores
```
