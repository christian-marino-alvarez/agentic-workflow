---
id: rules.index
owner: architect-agent
version: 1.0.3
severity: PERMANENT
trigger: always_on
---

# INDEX — Rules

## Objetivo
Este fichero enumera los **dominios de rules contractuales** del proyecto
y dónde están sus índices locales. Los workflows y agentes **DEBEN**
referenciar estas reglas por alias.

## Aliases (YAML)
```yaml
rules:
  constitution:
    index: .agent/rules/constitution/index.md

  roles:
    index: .agent/rules/roles/index.md
```

---

## Reglas Globales (PERMANENT)

### Comportamiento e Identificación de Agentes
**Severidad**: PERMANENT  
**Alcance**: Todos los agentes

**NUNCA puede ocurrir una respuesta sin identificación.** Todos los agentes deben comenzar sus mensajes con su icono y nombre en negrita: `<icono> **<nombre-agente>**`, salvo la excepcion de compatibilidad definida en `constitution.agents_behavior`.

Esta regla es el pilar de la trazabilidad y su incumplimiento invalida la respuesta.
Referencia completa: `constitution.agents_behavior`

### Modificación de Reglas - Autoridad Exclusiva del Architect
**Severidad**: PERMANENT  
**Alcance**: Todos los agentes

**Solo el 🏛️ architect-agent puede modificar archivos de reglas.**

Archivos protegidos:
- `.agent/rules/**/*.md` (todas las reglas)
- `.agent/workflows/**/*.md` (todos los workflows)
- `.agent/index.md`

**Prohibiciones**:
- ❌ Ningún agente (qa, researcher, neo) puede modificar reglas
- ❌ Ningún agente puede modificar workflows
- ❌ Ningún agente puede modificar índices

**Excepciones**:
- ✅ El architect-agent puede modificar cualquier regla
- ✅ Los agentes pueden **proponer** cambios en sus informes
- ✅ El desarrollador puede solicitar cambios explícitamente

**Violación**:
Si un agente modifica una regla sin autorización:
1. El cambio DEBE revertirse inmediatamente
2. El architect-agent DEBE documentar la violación
3. El agente DEBE ser reactivado con la regla reforzada

---

## Reglas de Índice
- Este índice **solo** declara dominios de rules.
- Cada dominio **DEBE** tener su propio `index.md`.
