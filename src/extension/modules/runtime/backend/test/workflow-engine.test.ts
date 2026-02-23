
import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowEngine } from '../workflow-engine.js';
import { WorkflowPersistence } from '../persistence.js';
import type { WorkflowDef } from '../../types.js';

// Mock de persistence en memoria
class MockPersistence extends WorkflowPersistence {
  constructor() {
    super('/mock/workspace');
  }
  override async saveState(): Promise<void> { /* no-op */ }
  override async loadState() { return null; }
}

const createMockWorkflowDef = (): WorkflowDef => ({
  id: 'workflow.test-lifecycle',
  owner: 'architect-agent',
  version: '1.0.0',
  severity: 'PERMANENT',
  blocking: true,
  constitutions: ['constitution.clean_code'],
  steps: [
    { number: 1, title: 'Primer paso', content: 'Hacer algo', isGate: false },
    { number: 2, title: 'Gate de aprobación', content: 'SI / NO', isGate: true },
  ],
  gate: {
    requirements: ['Paso 1 completado', 'Documentación verificada'],
    failStep: 10,
  },
  passTarget: 'phase-5',
  failBehavior: 'block',
  rawContent: '# test',
  sections: {
    inputs: [],
    outputs: [],
    templates: [],
    objective: '',
  },
});

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;
  let persistence: MockPersistence;

  beforeEach(() => {
    persistence = new MockPersistence();
    engine = new WorkflowEngine('/mock/workspace', persistence);
  });

  describe('getState', () => {
    it('debería retornar null cuando no hay actor activo', () => {
      expect(engine.getState()).toBeNull();
    });
  });

  describe('getAgents / hasAgent', () => {
    it('debería retornar array vacío inicialmente', () => {
      expect(engine.getAgents()).toEqual([]);
    });

    it('debería retornar false para agente no registrado', () => {
      expect(engine.hasAgent('desconocido-agent')).toBe(false);
    });
  });

  describe('getWorkflow', () => {
    it('debería retornar undefined para workflow no cargado', () => {
      expect(engine.getWorkflow('inexistente')).toBeUndefined();
    });
  });

  describe('on / off', () => {
    it('debería registrar y desregistrar listeners', () => {
      const listener = () => { };
      engine.on('stateChange', listener);
      engine.off('stateChange', listener);
      // No debería lanzar error
    });
  });

  describe('respondToGate', () => {
    it('debería lanzar error si no hay workflow activo', () => {
      expect(() => engine.respondToGate({
        gateId: 'test',
        decision: 'SI',
      })).toThrow(/No active workflow/);
    });
  });

  describe('start', () => {
    it('debería lanzar error si workflow no está cargado', async () => {
      await expect(engine.start({
        taskId: 'T001',
        strategy: 'long',
        workflowId: 'inexistente',
      })).rejects.toThrow(/not loaded/);
    });
  });
});
