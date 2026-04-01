/**
 * Chat LLM Prompts — Single source of truth for all prompt strings
 * injected into the LLM system prompt or used as user-message overrides.
 *
 * Pattern: each prompt is a function accepting interpolation params.
 */

/**
 * Behavioral preamble injected at the TOP of every LLM system prompt.
 * Critical for controlling model output behavior.
 */
export function behavioralPreamble(projectName: string): string {
  return [
    '## CRITICAL OUTPUT RULES (READ FIRST)',
    '',
    `### PROJECT: ${projectName}`,
    '',
    '### CONTEXT IS PRE-LOADED',
    'Your system prompt ALREADY contains: role persona, workflow, constitutions, indexes.',
    'Do NOT use readFile to load constitutions, indexes, or workflow files — they are HERE.',
    'Do NOT report errors about missing constitutions or indexes.',
    '',
    '### OUTPUT BEHAVIOR',
    '1. NEVER narrate what you are doing. No "I will...", "Let me...", "Loading...".',
    '2. Use writeFile SILENTLY when needed, then show only the result.',
    '3. A response that only acknowledges without advancing is FORBIDDEN.',
    '4. Show ONLY: questions for user, confirmed outcomes, errors needing user action.',
    '',
    '### MANDATORY A2UI USAGE',
    'When you need the user to make ANY decision or confirmation, you MUST use <a2ui> components.',
    '- YES/NO questions → <a2ui type="confirm" id="..." label="...">',
    '- Choose from options → <a2ui type="choice" id="..." label="...">',
    '- Multiple selections → <a2ui type="multi" id="..." label="...">',
    'NEVER ask a question as plain text if it can be an <a2ui> component.',
    'Gate approvals (SI/NO), phase confirmations, and all workflow decisions MUST use <a2ui>.',
    '',
  ].join('\n');
}

/**
 * Sent as user message when a slash command triggers a workflow.
 */
export function workflowStartPrompt(commandId: string): string {
  return `Acabo de lanzar el comando /${commandId}. Por favor, actúa como el agente asignado (owner). Hemos iniciado este flujo. Saluda brevemente y formula las preguntas necesarias según el workflow steps. Cuando necesites que el usuario elija entre opciones, usa bloques <a2ui> como se describe en el A2UI Catalog cargado en tu contexto. Sé conciso (2-3 frases máximo) y conversacional. NO uses tools ahora, solo dialoga.`;
}

/**
 * Sent as user message after the init A2UI is confirmed (language + strategy).
 * The background has already created init.md and advanced the workflow.
 */
export function initCompletedPrompt(language: string, strategy: string): string {
  const langLabel = language === 'es' ? 'Español' : 'English';
  return `El usuario ha seleccionado idioma "${langLabel}" y estrategia "${strategy}". El init.md ha sido creado y el Gate de inicialización ha sido aprobado. Ahora pregunta al usuario: "¿Qué tarea quieres iniciar? Dame un título corto y el objetivo." NO uses tools. NO narres el proceso. Solo pregunta.`;
}

/**
 * Sent as user message when the user provides a task title after init.
 * The background has already started the lifecycle workflow.
 */
export function lifecycleStartPrompt(taskText: string, lifecycleId: string): string {
  const isLong = lifecycleId.includes('long');
  const firstPhase = isLong
    ? 'Phase 0: Acceptance Criteria (/phase-0-acceptance-criteria). Debes formular las 5 preguntas obligatorias de aceptación antes de avanzar a cualquier otra fase. NO delegues a ningún agente todavía. NO pases a research ni análisis sin completar esta fase.'
    : 'Phase 1: Brief (/short-phase-1-brief). Incluye las 5 preguntas obligatorias y la detección de complejidad.';

  return `El usuario quiere iniciar la tarea: "${taskText}". El workflow "${lifecycleId}" ya ha sido lanzado. La primera fase es: ${firstPhase}. Ejecuta SOLO esta fase. NO uses tools. Responde con las preguntas de esta fase.`;
}

/**
 * A2UI Component Catalog — injected into every LLM system prompt.
 * Defines the exact format for interactive UI components the model can emit.
 */
export const A2UI_INSTRUCTIONS = `

## Interactive UI Components (A2UI)
When you need the user to choose between options, you MUST use this EXACT format in your response.
DO NOT invent custom tags, attributes, or formats. Use EXACTLY this syntax:

\\\`\\\`\\\`
<a2ui type="choice" id="unique-id" label="Question Title">
- [ ] Option A
- [ ] Option B
- [ ] Option C
</a2ui>
\\\`\\\`\\\`

Rules:
- The tag MUST be lowercase: <a2ui> (NOT <A2UI>, NOT <a2ui-options>, NOT <a2ui-select>)
- Attributes MUST use double quotes and include: type, id, label
- Options MUST use markdown checkbox syntax: "- [ ] text" (one per line)
- Pre-select with "- [x] text"
- You can have multiple <a2ui> blocks in one message
- Text before/after blocks renders as normal markdown
- type="choice" for single select (radio buttons)
- type="confirm" for yes/no
- type="multi" for checkboxes

Example combining text and interactive component:
"¡Hola! Confirmemos la configuración inicial:

<a2ui type=\\"choice\\" id=\\"language\\" label=\\"Idioma de conversación\\">
- [x] Español
- [ ] English
</a2ui>

<a2ui type=\\"choice\\" id=\\"strategy\\" label=\\"Estrategia de ciclo de vida\\">
- [ ] Long (9 fases completas)
- [ ] Short (3 fases simplificadas)
</a2ui>"
`;
