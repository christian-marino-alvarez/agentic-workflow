---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 7-node-js-backend-scaffolding
---

# Research Report — 7-node-js-backend-scaffolding

🔬 **researcher-agent**: Investigación técnica sobre ejecución de procesos Node.js y modularidad.

## 1. Resumen ejecutivo
Investigación de las capacidades nativas de Node.js y Fastify para soportar la ejecución fuera del proceso principal de VS Code.
Se documentan las APIs de `child_process`, el sistema de plugins de `fastify` y las restricciones documentadas de VS Code Extension Host.

---

## 2. Necesidades detectadas
- Ejecución de código Node.js independiente del Extension Host.
- Capacidad de estructurar código de forma modular (múltiples dominios lógicos).
- Comunicación inter-procesos (IPC) o vía red (HTTP/Socket).

---

## 3. Hallazgos técnicos

### Node.js: Child Processes
API nativa de Node.js para lanzar subprocesos, disponible en el entorno Electron de VS Code.

- **API**: `child_process.spawn(command, [args], [options])`.
- **Comunicación**:
    - **Stdio**: `stdin`, `stdout`, `stderr` (pipes standard).
    - **IPC Channel**: Disponible si se lanza con `fork` (solo Node a Node), permite `process.send()`.
- **Ciclo de Vida**:
    - `detached: true/false`: Controla si el hijo sobrevive al padre.
    - Señales: `SIGTERM`, `SIGINT`.
- **Recursos**:
    - Cada instancia de V8 (Node process) tiene un consumo base de memoria (~30MB RSS mínimo en arranque).
    - [Node.js Child Process Documentation](https://nodejs.org/api/child_process.html)

### Fastify: Encapsulation & Plugins
Fastify implementa un modelo de encapsulación basado en grafos acíclicos directos (DAG).

- **Plugins**: Permiten dividir la aplicación en contextos aislados.
- **Scope**: Los decoradores y hooks registrados en un plugin encapsulado no se filtran a los padres ni hermanos, solo a hijos.
- **Modularidad**: Permite definir "microservicios lógicos" dentro de una misma instancia, con configuraciones y validaciones independientes (ej: prefijos de ruta `/api/v1/auth`, `/api/v1/agents`).
- **Recursos**: Comparte el mismo Event Loop y memoria del proceso principal.
- [Fastify Encapsulation Guide](https://fastify.dev/docs/latest/Reference/Encapsulation/)

### VS Code Extension Host: Restricciones
- El Extension Host es un proceso Node.js único donde corren todas las extensiones.
- **Bloqueo**: Código síncrono o heavy-cpu en el Extension Host congela todas las extensiones.
- **Recomendación Oficial**: Microsoft recomienda mover tareas pesadas (Language Servers, Linters, AI models) a procesos separados o Workers.
- [VS Code Extension Host Architecture](https://code.visualstudio.com/api/advanced-topics/extension-host)

---

## 4. APIs relevantes para implementación

### `net` (Node.js)
- Permite detectar puertos libres dinámicamente (`server.listen(0)`).
- Necesario para evitar colisiones si se usan servidores HTTP en backends locales.

### `AbortController`
- Estándar para cancelar operaciones asíncronas o detener servidores limpiamente.
- Soportado en Node.js recientes y Fastify.

---

## 5. Compatibilidad multi-browser
- **Web Extensions**:
    - `child_process` **NO** existe en el navegador.
    - `modules` de Node.js no existen.
    - **Implicación**: Cualquier arquitectura basada en `spawn` no funcionará en `vscode.dev` sin un componente servidor remoto.
    - La arquitectura debe abstraer la URL del backend (localhost vs remote).

---

## 6. Riesgos identificados (Documentados)

- **Gestión de Procesos Huérfanos**:
    - Si el proceso padre (VS Code) crashea, el hijo puede quedar vivo (zombie) si no se gestiona la desconexión del canal IPC o stdio.
    - Documentación Node.js: "By default, the parent will wait for the detached child to exit."

- **Firewall / Permisos de Red**:
    - Levantar un servidor HTTP (`localhost`) puede disparar alertas de Firewall en Windows/macOS la primera vez.
    - El uso de `localhost` vs `127.0.0.1` puede tener comportamientos diferentes de resolución DNS en algunas máquinas (Node.js v17+ prefiere IPv6).

---

## 7. Fuentes
- [Node.js Child Process](https://nodejs.org/api/child_process.html)
- [Fastify Ecosystem](https://fastify.dev/ecosystem/)
- [VS Code Process Model](https://code.visualstudio.com/blogs/2015/11/17/sync-to-async)

---

## 8. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T16:52:24+01:00
    comments: Aprobado por usuario via chat.
```
