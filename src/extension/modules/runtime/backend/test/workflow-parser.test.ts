
import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowParser } from '../workflow-parser.js';

describe('WorkflowParser', () => {
  let parser: WorkflowParser;

  beforeEach(() => {
    parser = new WorkflowParser('/mock/workspace');
  });

  describe('parseContent', () => {
    it('debería parsear frontmatter simple con id', () => {
      const markdown = `---
id: workflow.test
owner: architect-agent
version: 1.0.0
severity: PERMANENT
blocking: true
---

# WORKFLOW: test

## Mandatory Steps
1. Primer paso
2. Segundo paso
`;
      const result = parser.parseContent(markdown, 'test.md');

      expect(result.id).toBe('workflow.test');
      expect(result.owner).toBe('architect-agent');
      expect(result.blocking).toBe(true);
    });

    it('debería manejar doble frontmatter (patrón init.md)', () => {
      const markdown = `---
description: "Workflow de ejemplo"
---

---
id: workflow.init
owner: architect-agent
version: 2.0.0
blocking: true
---

# WORKFLOW: init

## Mandatory Steps
1. Paso uno
`;
      const result = parser.parseContent(markdown, 'init.md');

      expect(result.id).toBe('workflow.init');
      expect(result.owner).toBe('architect-agent');
    });

    it('debería extraer constitutions desde bloques IMPORTANT', () => {
      const markdown = `---
id: workflow.test
owner: architect-agent
blocking: true
---

# WORKFLOW: test

> [!IMPORTANT]
> Load \`constitution.clean_code\` before starting
> Load \`constitution.backend\`

## Mandatory Steps
1. Do something
`;
      const result = parser.parseContent(markdown, 'test.md');

      expect(result.constitutions).toContain('constitution.clean_code');
      expect(result.constitutions).toContain('constitution.backend');
      expect(result.constitutions).toHaveLength(2);
    });

    it('debería extraer gate con requirements', () => {
      const markdown = `---
id: workflow.test
owner: architect-agent
blocking: true
---

# WORKFLOW: test

## Mandatory Steps
1. Do something

## Gate

1. First requirement
2. Second requirement

If Gate FAIL, execute Step 10 (FAIL).
`;
      const result = parser.parseContent(markdown, 'test.md');

      expect(result.gate).not.toBeNull();
      expect(result.gate!.requirements).toHaveLength(2);
      expect(result.gate!.requirements[0]).toBe('First requirement');
      expect(result.gate!.failStep).toBe(10);
    });

    it('debería detectar passTarget desde aliases', () => {
      const markdown = `---
id: workflow.test
owner: architect-agent
blocking: true
---

# WORKFLOW: test

## Mandatory Steps
1. Do work

## PASS (only if Gate approved)
- Set task.phase.current = aliases.tasklifecycle-long.phases.phase_5.id
`;
      const result = parser.parseContent(markdown, 'test.md');
      expect(result.passTarget).toBe('phase-5');
    });

    it('debería detectar failBehavior como retry cuando menciona iterate', () => {
      const markdown = `---
id: workflow.test
owner: architect-agent
blocking: true
---

# WORKFLOW: test

## Mandatory Steps
1. Do work

## FAIL (MANDATORY)
Iterate until Gate PASS.
`;
      const result = parser.parseContent(markdown, 'test.md');
      expect(result.failBehavior).toBe('retry');
    });

    it('debería lanzar error si no hay frontmatter con id', () => {
      const markdown = `---
description: "Sin id"
---

# Just a document
`;
      expect(() => parser.parseContent(markdown, 'bad.md')).toThrow(
        /No valid frontmatter with 'id' found/
      );
    });

    it('debería fallar validación sin owner', () => {
      const markdown = `---
id: workflow.test
blocking: true
---

# Missing owner
`;
      expect(() => parser.parseContent(markdown, 'no-owner.md')).toThrow(
        /Missing required field: owner/
      );
    });

    it('debería usar blocking: true por defecto', () => {
      const markdown = `---
id: workflow.test
owner: architect-agent
---

# WORKFLOW: test
`;
      const result = parser.parseContent(markdown, 'default-blocking.md');
      expect(result.blocking).toBe(true);
    });

    it('debería conservar rawContent original', () => {
      const markdown = `---
id: workflow.test
owner: architect-agent
blocking: true
---

# WORKFLOW: test
`;
      const result = parser.parseContent(markdown, 'raw.md');
      expect(result.rawContent).toBe(markdown);
    });
  });
});
