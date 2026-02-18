# T032: Servidor Runtime & Sandbox de Acciones - Criterios de Aceptación

## 1. Resumen
- **Objetivo**: Implementar un Servidor Runtime dedicado (action-runner) dentro de la extensión para ejecutar operaciones sensibles (E/S de Archivos, Ejecución de Comandos) en un entorno controlado.
- **Características Clave**:
  - Proceso hijo Node.js aislado (lanzado por el Extension Host).
  - Comunicación JSON-RPC sobre IPC/Pipes.
  - Modelo de permisos basado en Habilidades (Skill-based) (definido en `.agent/rules/roles/*.md`).
  - UI de permisos conducida por Chat (Diálogos/Modales).
  - Modos "Acceso Total" vs "Sandbox".

## 2. Preguntas de Clarificación y Respuestas

1.  **Aislamiento/IPC**:
    - **P**: ¿Debe ser un proceso hijo separado? ¿Mecanismo IPC?
    - **R**: **SÍ**. Proceso Node.js separado. JSON-RPC sobre IPC.

2.  **Modelo de Permisos**:
    - **P**: ¿Granularidad?
    - **R**: **Por acción**. Skills definidas en Markdowns de Roles. El Agente debe tener la skill + Aprobación del Usuario. Seguridad similar a Google/Claude/OpenAI.

3.  **Alcance de Acciones**:
    - **P**: ¿Lista de acciones para el desarrollo?
    - **R**: Proveer lista. (Ver Sección 3).

4.  **Nivel de Sandboxing**:
    - **P**: ¿Intercepción lógica vs nivel SO?
    - **R**: **Sandbox** Lógico. Incluir opción "Acceso Total" en la UI del Chat.

5.  **Interacción UI**:
    - **P**: ¿Presentación del prompt?
    - **R**: **Diálogos en Chat (Opción B)**.

## 3. Alcance de la Implementación (Acciones)

El Servidor Runtime DEBE implementar las siguientes "acciones" (habilidades):

### Sistema de Archivos (`fs`)
- `fs.readFile(path)`: Leer contenido de archivo.
- `fs.writeFile(path, content)`: Escribir/Sobrescribir archivo.
- `fs.listFiles(path)`: Listar contenidos de directorio.
- `fs.deleteFile(path)`: Borrar archivo (Crítico - Alto Riesgo).
- `fs.createDirectory(path)`: Crear directorio (recursivo).

### Shell (`terminal`)
- `terminal.runCommand(command, cwd)`: Ejecutar comando de shell.

### Utilidad (`vscode`)
- `vscode.openFile(path)`: Abrir archivo en el editor (acción segura, enrutada al host).

## 4. Criterios de Aceptación (AC)

### 4.1 Arquitectura Runtime
- [ ] **Proceso Runtime**: Existe un nuevo punto de entrada `server/index.ts` (o similar) que corre como proceso Node.js aislado.
- [ ] **Ciclo de Vida**: El Extension Host lanza este proceso al inicio y lo mata al desactivarse.
- [ ] **IPC**: La comunicación usa un protocolo formal JSON-RPC 2.0 (o formato estructurado similar) sobre canal `stdio` o `ipc`.
- [ ] **Heartbeat**: El Extension Host puede detectar si el Runtime crashea y reiniciarlo.

### 4.2 Motor de Permisos
- [ ] **Validación de Skill**: Antes de ejecutar una acción, el sistema verifica si el Rol de Agente activo tiene la skill correspondiente (ej: `skills: ["fs", "terminal"]`) en su definición markdown.
- [ ] **Prompt de Usuario**: Si la acción requiere permiso, aparece un diálogo (en el Chat): "El Agente X quiere ejecutar [Acción]. ¿Permitir?".
- [ ] **Modos**:
  - **Modo Sandbox (Default)**: Pide permiso para cada acción sensible (Write, Delete, Run Command). Read podría ser auto-permitido si se configura.
  - **Modo Acceso Total**: Si se habilita para la sesión/agente, las acciones evitan el prompt (se loguean pero no bloquean).

### 4.3 Implementación de Acciones
- [ ] **Operaciones de Archivo**: `readFile`, `writeFile`, `listFiles` están implementadas y funcionales.
- [ ] **Ejecución de Comandos**: `runCommand` ejecuta exitosamente y transmite stdout/stderr de vuelta al host.
- [ ] **Manejo de Errores**: Errores del Runtime (permiso denegado, archivo no encontrado) son serializados y devueltos al Extension Host como errores JSON-RPC.

### 4.4 Integración UI
- [ ] **Diálogos de Chat**: La UI del Chat renderiza solicitudes de permiso de forma interactiva (botones Permitir/Denegar).
- [ ] **Indicador de Estado**: La UI muestra el modo actual (Sandbox/Acceso Total).

## 5. Aprobación del Desarrollador

Para proceder a la Fase 1 (Investigación), el desarrollador DEBE aprobar este documento.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-18T21:44:00+01:00
    comments: Approved by user
```
