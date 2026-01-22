# Plan de Implementación - Developer Feedback Gate

## Archivos a Modificar

### 1. Workflow: Phase 7 (Evaluation)
**Archivo**: `.agent/workflows/tasklifecycle/phase-7-evaluation.md`
- **Cambio**:
  - Insertar nuevo **Paso 6**: Solicitud interactivas de feedback.
  - Renumerar paso actual "PASS" a **Paso 7**.
  - Actualizar sección **Gate** para exigir `Aprobado: SI` en metrics.

### 2. Workflow: Phase 8 (Commit)
**Archivo**: `.agent/workflows/tasklifecycle/phase-8-commit-push.md`
- **Cambio**:
  - Actualizar **Paso 1 (Verificar inputs)**.
  - Añadir condición: `Existe metrics.md y contiene 'Aprobado: SI'`.

### 3. Template: Metrics
**Archivo**: `.agent/templates/task-metrics.md`
- **Cambio**:
  - Añadir al final del archivo:
    ```markdown
    ## 4. Validación del Desarrollador
    - Aprobado: [SI/NO]
    - Puntuación (0-5):
    - Comentario:
    ```

## Estrategia de Verificación
Debido a que modificamos la lógica del sistema, la verificación será una revisión del código estático y una simulación lógica:
1. Confirmar que los pasos son secuenciales.
2. Confirmar que la condición de bloqueo en Phase 8 coincide con el output de Phase 7.
