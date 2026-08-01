---
id: HU-009
titulo: Configurar estrategia de priorización por proyecto
epica: EP-003
prioridad: Must
complejidad: M
estado: lista
dependencias: [HU-008]
---

# HU-009 — Configurar estrategia de priorización por proyecto

**Como** Delivery Lead de un proyecto,
**quiero** seleccionar y configurar la estrategia de priorización (Relativa, Absoluta o Mixta) para mi proyecto,
**para** que el score de prioridad se adapte a nuestras necesidades específicas.

## Fuente

PRD §6 (Funcionalidades Must: score de priorización configurable). ADR-007 (Motor Polimórfico).

## Estrategias disponibles

- **Relativa** (default): Usa `target_date` en el cálculo (urgencia temporal)
- **Absoluta**: Usa constante fija (ej: 8.5) en lugar de fecha
- **Mixta**: Combina urgencia + salud + valor según pesos predefinidos

## Chequeo INVEST

- **Valiosa**: ✓
- **Independiente**: ✓
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Cambiar estrategia a Absoluta (por proyecto)
```gherkin
Dado que estoy en la configuración del proyecto
Cuando selecciono "Estrategia Absoluta" del dropdown
Y ingreso la constante "8.5"
Y presiono "Guardar"
Entonces el proyecto usa esa constante para calcular score
Y el cambio se persiste en BD
Y el score del proyecto se recalcula inmediatamente
```

### Escenario 2: Estrategia Relativa es el default
```gherkin
Dado que creo un nuevo proyecto
Cuando no cambio la estrategia de priorización
Entonces por defecto usa "Estrategia Relativa"
Y el score se calcula: 0.3×salud + 0.25×urgencia + 0.25×valor + 0.2×críticas
```

### Escenario 3: Validación de constante
```gherkin
Dado que intento guardar estrategia Absoluta
Cuando ingreso un valor inválido (negativo o >100)
Entonces el sistema rechaza con mensaje "Constante debe estar entre 0 y 100"
Y la configuración anterior se mantiene
```

### Escenario 4: Cambio de estrategia recalcula proyectos
```gherkin
Dado que un proyecto con score 6.2 (Relativa)
Cuando cambio a Absoluta con constante 8.5
Y presiono Guardar
Entonces el score cambia a 8.5 inmediatamente
Y el Dashboard se actualiza vía SSE
```

### Escenario 5: Interfaz muestra/oculta campos según estrategia
```gherkin
Dado que estoy en la configuración del proyecto
Cuando selecciono "Relativa" o "Mixta"
Entonces el input de "Constante de prioridad" se deshabilita
Y no puedo enviar un valor al backend
```
