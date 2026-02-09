🏛️ **architect-agent**: Diseñando el Plan de Implementación para la migración selectiva.

---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 3-migracion-sistema-agentes
---

# Implementation Plan — 3-migracion-sistema-agentes

## 1. Resumen del plan
- **Contexto**: Necesitamos exportar el core del sistema de agentes a un entorno NPM independiente y agnóstico a VS Code.
- **Resultado esperado**: Un script de exportación funcional, un nuevo repositorio con el core portado y diagramas técnicos.
- **Alcance**: Incluye `cli`, `runtime`, `mcp`, `infrastructure`, `agentic-system-structure` y la configuración base (NPM/TS). Excluye `extension`.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/3-migracion-sistema-agentes/task.md`
- **Analysis**: `.agent/artifacts/3-migracion-sistema-agentes/analysis.md`
- **Acceptance Criteria**: Ver `acceptance.md` (AC-1 a AC-5).

**Dispatch de dominios**
```yaml
plan:
  workflows:
    - domain: "scripts"
      action: "create"
      workflow: "none"
    - domain: "documentation"
      action: "create"
      workflow: "none"
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Diseño del script de exportación (`scripts/export-agentic-core.mjs`)
- **Descripción**: Crear un script Node.js que realice la copia selectiva y la transformación del `package.json`.
- **Dependencias**: Ninguna.
- **Entregables**: Archivo `scripts/export-agentic-core.mjs`.
- **Agente responsable**: architect-agent (diseño) / neo-agent (ejecución).

### Paso 2: Ejecución de la migración y validación de estructura
- **Descripción**: Ejecutar el script para generar el directorio de destino (ej: `../agentic-core-migrated`) y validar que la estructura sea correcta.
- **Dependencias**: Paso 1.
- **Entregables**: Directorio de salida con el código portado.
- **Agente responsable**: neo-agent.

### Paso 3: Limpieza y ajuste de `package.json` en destino
- **Descripción**: El script debe filtrar dependencias de VS Code y asegurar que los scripts de `build` y `start` funcionen.
- **Dependencias**: Paso 2.
- **Entregables**: `package.json` funcional en el destino.
- **Agente responsable**: neo-agent (vía script).

### Paso 4: Creación de Diagramas Técnicos
- **Descripción**: Generar diagramas Mermaid que expliquen el flujo de los agentes y la arquitectura del runtime.
- **Dependencias**: Ninguna.
- **Entregables**: Archivo `DOCS.md` o actualización del `README.md` en el destino con diagramas.
- **Agente responsable**: architect-agent.

### Paso 5: Verificación final
- **Descripción**: Validar que el nuevo sistema arranca y que el servidor MCP es funcional.
- **Dependencias**: Pasos 1-4.
- **Entregables**: Informe de verificación.
- **Agente responsable**: architect-agent.

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Responsabilidades: Supervisión del proceso, creación de diagramas técnicos y validación de la integridad del sistema portado.
- **Neo-Agent**
  - Responsabilidades: Implementación técnica del script de migración y ejecución de la portabilidad.

**Handoffs**
- El Architect entrega el plan aprobado.
- El Neo-agent implementa y ejecuta el script.
- El Architect valida los resultados y genera la documentación visual.

---

## 5. Estrategia de testing y validación
- **Validación Estática**: Verificar que no existan imports hacia `shared` o `extension` en el código migrado.
- **Validación Dinámica**: 
  - `npm install` en el destino.
  - `npm run build` en el destino.
  - Ejecutar un comando simple del CLI (ej: `agentic-workflow help`).
- **Trazabilidad**: Relacionar resultados con los AC definidos.

---

## 7. Estimaciones y pesos de implementación
- **Paso 1 (Script)**: Medio (requiere lógica de filtrado de JSON y copia de archivos).
- **Paso 4 (Diagramas)**: Medio (requiere síntesis de arquitectura).
- **Esfuerzo Total**: Medio-Alto.

---

## 8. Puntos críticos y resolución
- **Punto crítico 1: Dependencias transversales**
  - Riesgo: Que falten utilidades de `infrastructure`.
  - Resolución: Incluir `src/infrastructure` completo en la exportación inicial.
- **Punto crítico 2: Incompatibilidad de scripts**
  - Riesgo: Que el script de `build` original dependa de herramientas de VS Code.
  - Resolución: El exportador creará un `package.json` con scripts simplificados exclusivos para el core.

---

## 10. Criterios de finalización
- [ ] El script de exportación existe y es ejecutable.
- [ ] El directorio de salida contiene el core sin rastros de la extensión de VS Code.
- [ ] `npm run build` es exitoso en el nuevo entorno.
- [ ] Los diagramas Mermaid están documentados y son precisos.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-09T19:57:45Z
    comments: Aprobado por el usuario.
```
