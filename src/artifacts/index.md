---
id: artifacts.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
---

# INDEX — Artifacts

## Objetivo
Este fichero es el **índice del dominio artifacts**.
Define rutas y alias contractuales para los artifacts generados dinámicamente.

## Aliases (YAML)
```yaml
artifacts:
  # Candidate artifacts
  candidate:
    dir: .agent/artifacts/candidate
    init: .agent/artifacts/candidate/init.md
    task: .agent/artifacts/candidate/task.md

  # No hay referencias a .agent/tasks en este dominio
```

## Reglas

### Regla 1 (MEMORY): Ubicación de artefactos del tasklifecycle
Los artefactos generados durante el **tasklifecycle** (task.md, research.md, analysis.md, 
plan.md, verification.md, metrics.md, changelog.md, walkthrough.md) **DEBEN** crearse en:
- `.agent/artifacts/<taskId>-<taskTitle>/`

**NO** en el directorio de Antigravity (`~/.gemini/antigravity/brain/`), que es solo
para artefactos temporales de sesión que no se versionan.

### Regla 2: Declaración de artifacts
- Los artifacts dinámicos por tarea **NO** se declaran aquí.
- Solo se declaran rutas canónicas de candidate.

### Regla 3 (PERMANENT): Higiene de artefactos
- **ESTÁ PROHIBIDO** escribir o persistir ficheros en `.agent/artifacts/` que no formen parte oficial del workflow de desarrollo de `.agent`.
- Esto incluye ficheros de metadatos temporales (`.metadata.json`), ficheros de resolución de conflictos (`.resolved`, `.resolved.N`) o cualquier otro artefacto técnico interno de la IA.
- Solo deben persistirse los documentos canónicos definidos en el lifecycle (task.md, analysis.md, etc.).

### Excepción (PERMANENT): Artefactos suplementarios
Se permiten artefactos suplementarios **solo si** cumplen todos los requisitos:
1. Están listados en `task.artifacts.supplemental` dentro de `task.md`.
2. Usan el template `templates.supplemental_report`.
3. Se almacenan dentro de `.agent/artifacts/<taskId>-<taskTitle>/`.
