---
id: workflow.tasklifecycle.phase-0-acceptance-criteria
3: description: Convierte el task candidate en una tarea definitiva. El arquitecto define los acceptance criteria mediante 5 preguntas obligatorias basadas en la tarea y su objetivo, y crea el current task necesario para iniciar el ciclo de vida.
4: owner: architect-agent
5: version: 1.3.0
6: severity: PERMANENT
7: trigger:
8:   commands: ["phase0", "phase-0", "acceptance", "acceptance-criteria"]
9: blocking: true
10: ---
11: 
12: # WORKFLOW: tasklifecycle.phase-0-acceptance-criteria
13: 
14: ## Input (REQUIRED)
15: - Task candidate creado por `workflow.tasklifecycle`:
16:   - `artifacts.candidate.task`
17: - El `task.md` candidate **DEBE** incluir:
18:   - descripción de la tarea
19:   - objetivo de la tarea
20: 
21: > [!IMPORTANT]
22: > **Constitución activa (OBLIGATORIO)**:
23: > - Cargar `constitution.extensio_architecture` antes de iniciar
24: > - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)
25: 
26: ## Output (REQUIRED)
27: - Current task (definitiva) con acceptance criteria completos:
28:   - `.agent/artifacts/<taskId>-<taskTitle>/task.md`
29: 
30: ## Template (OBLIGATORIO)
31: - La current task **DEBE** crearse usando el template:
32:   - `templates.task`
33: - Si el template no existe o no se puede cargar → **FAIL**.
34: 
35: ## Objetivo (ONLY)
36: - Pasar de **task candidate** a **current task** (definitiva).
37: - **Calcular el `taskId` definitivo**.
38: - Definir acceptance criteria **obligatorios** a partir de 5 preguntas al desarrollador.
39: - Registrar los acceptance criteria dentro del fichero de current task.
40: 
41: ## Pasos obligatorios
42: 0. **Activación de Rol y Prefijo (OBLIGATORIO)**
43:    - El `architect-agent` **DEBE** comenzar su intervención identificándose.
44:    - Mensaje: `🏛️ **architect-agent**: Iniciando Phase 0 - Acceptance Criteria.`
45: 
46: 1. Cargar y leer el task candidate:
47:    - `artifacts.candidate.task`
48:    - Extraer:
49:      - descripción de la tarea
50:      - objetivo de la tarea
51:    - Si faltan → ir a **Paso 10 (FAIL)**.
52: 
53: 2. Cargar template contractual de task
54:    - Cargar `templates.task`
55:    - Si no existe o no se puede cargar → ir a **Paso 10 (FAIL)**.
56: 
57: 3. **Calcular `taskId` (OBLIGATORIO – architect)**
58:    - El `architect-agent` **DEBE** ejecutar el siguiente comando:
59:      ```bash
60:      ls .agent/artifacts/ | grep -E "^[0-9]" | sort -n | tail -1 | cut -d'-' -f1
61:      ```
62:    - El output muestra el último taskId (ej: "8")
63:    - El nuevo `taskId = output + 1` (ej: si output es "8", nuevo taskId es "9")
64:    - Si no hay output (sin tareas previas) → `taskId = 1`
65:    - El valor final de `taskId` es **obligatorio** para continuar.
66: 
67: 4. Definir `taskTitle` (architect)
68:    - Derivar `taskTitle` desde la solicitud del desarrollador (candidate).
69:    - Normalizar para filesystem:
70:      - minúsculas
71:      - espacios → `-`
72:      - sin caracteres especiales
73: 
74: 5. Formular preguntas de clarificación (OBLIGATORIO, adaptativas a la tarea)
75:    - El `architect-agent` **DEBE** analizar:
76:      - `task.description`
77:      - `task.goal`
78:    - A partir de ese análisis, **DEBE formular exactamente 5 preguntas** cuyo objetivo sea:
79:      - eliminar ambigüedades
80:      - completar información faltante
81:      - permitir definir acceptance criteria verificables
82:    - Las preguntas:
83:      - **NO deben** duplicar información ya explícita
84:      - **DEBEN** estar directamente relacionadas con la tarea concreta
85:      - **PUEDEN** variar según el contexto de la tarea
86: 
87: 6. Validar respuestas y cerrar definición (OBLIGATORIO)
88:    - Confirmar que las 5 preguntas formuladas tienen respuesta explícita.
89:    - A partir de las respuestas, el `architect-agent` **DEBE**:
90:      - consolidar una definición completa de la tarea
91:      - derivar acceptance criteria verificables
92:    - Si alguna respuesta falta o sigue existiendo ambigüedad → ir a **Paso 10 (FAIL)**.
93: 
94: 7. Crear current task (OBLIGATORIO)
95:    - Crear el directorio de la tarea (si no existe):
96:      - `.agent/artifacts/<taskId>-<taskTitle>/`
97:    - Crear el fichero de estado:
98:      - `.agent/artifacts/<taskId>-<taskTitle>/task.md` (usando `templates.task`)
99:    - Crear el fichero de aceptación:
100:      - `.agent/artifacts/<taskId>-<taskTitle>/acceptance.md` (usando `templates.acceptance`)
101:    - El `task.md` **solo contendrá**:
102:      - metadatos (id, title, owner, strategy)
103:      - historial de fases
104:      - alias `task.acceptance` apuntando al nuevo fichero
105:    - El `acceptance.md` **contendrá**:
106:      - definición consolidada
107:      - las 5 respuestas detalladas
108:      - checklist de criterios verificables (AC)
109:    - Si no se puede crear/escribir → ir a **Paso 10 (FAIL)**.
110: 
111: 8. Solicitar aprobacion del desarrollador (OBLIGATORIA, por consola)
112:    - El desarrollador **DEBE** aprobar explicitamente:
113:      - Acceptance criteria
114:      - Current task creada
115:    - Registrar la decision en `acceptance.md`:
116:      ```yaml
117:      approval:
118:        developer:
119:          decision: SI | NO
120:          date: <ISO-8601>
121:          comments: <opcional>
122:      ```
123:    - Si `decision != SI` → ir a **Paso 10 (FAIL)**.
124: 
125: 9. PASS
126:    - Informar que la Fase 0 está completada correctamente.
127:    - El `architect-agent` **DEBE realizar explícitamente** las siguientes acciones (usando prefijo):
128:     - Marcar la Fase 0 como completada en el `task.md`.
129:     - Establecer `task.lifecycle.phases.phase-0-acceptance-criteria.validated_at = <ISO-8601>`.
130:     - Actualizar `task.phase.updated_at = <ISO-8601>`.
131:     - Actualizar el estado:
132:       - `task.phase.current = aliases.taskcycle-long.phases.phase_1.id`
133: 
134: 10. FAIL (obligatorio)
135:    - Declarar Fase 0 como **NO completada**.
136:    - Indicar exactamente qué falló.
137:    - Terminar bloqueado: no avanzar de fase.
138: 
139: ## Gate (REQUIRED)
140: 
141: Requisitos (todos obligatorios):
142: 1. Existe `.agent/artifacts/<taskId>-<taskTitle>/task.md` y `acceptance.md`.
143: 2. El current task incluye acceptance criteria completos y verificables.
144: 3. Existe aprobacion explicita del desarrollador registrada en `acceptance.md`:
145:    - `approval.developer.decision == SI`
146: 4. El `architect-agent` ha marcado explícitamente:
147:    - la Fase 0 como completada
148:    - `task.lifecycle.phases.phase-0-acceptance-criteria.completed == true`
149:    - `task.lifecycle.phases.phase-0-acceptance-criteria.validated_at` no nulo
150:    - `task.phase.updated_at` no nulo
151:    - `task.phase.current == aliases.taskcycle-long.phases.phase_1.id`
152: 
153: Si Gate FAIL:
154: - Ejecutar **FAIL**.
