
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorkflowPersistence } from '../persistence.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// Mock fs para no escribir archivos reales
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof fs>('node:fs/promises');
  return {
    ...actual,
    readFile: vi.fn(),
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    rename: vi.fn().mockResolvedValue(undefined),
  };
});

describe('WorkflowPersistence', () => {
  let persistence: WorkflowPersistence;

  beforeEach(() => {
    persistence = new WorkflowPersistence('/mock/workspace');
    vi.clearAllMocks();
  });

  describe('load', () => {
    it('debería crear DB por defecto si el fichero no existe', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

      const db = await persistence.load();

      expect(db.version).toBe(1);
      expect(db.activeTask).toBeNull();
      expect(db.states).toEqual({});
    });

    it('debería parsear DB existente desde disco', async () => {
      const mockDb = {
        version: 1,
        activeTask: 'T001',
        states: {
          T001: {
            taskId: 'T001',
            currentPhase: 'phase-2',
            currentWorkflowId: 'workflow.phase-2',
            status: 'running' as const,
            gateResponses: {},
            startedAt: '2026-01-01',
            updatedAt: '2026-01-01',
          },
        },
        lastUpdated: '2026-01-01',
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockDb));

      const db = await persistence.load();

      expect(db.activeTask).toBe('T001');
      expect(db.states.T001.status).toBe('running');
    });

    it('debería retornar cache en segunda llamada', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

      await persistence.load();
      await persistence.load();

      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveState', () => {
    it('debería guardar estado y actualizar activeTask', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

      await persistence.saveState({
        taskId: 'T002',
        currentPhase: 'phase-1',
        currentPhaseId: 'phase-1',
        currentWorkflowId: 'workflow.phase-1',
        isLifecycle: false,
        status: 'running',
        gateResponses: {},
        startedAt: '2026-01-01',
        updatedAt: '2026-01-01',
      });

      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });
  });

  describe('loadState', () => {
    it('debería retornar null si no hay tarea activa', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

      const state = await persistence.loadState();
      expect(state).toBeNull();
    });
  });

  describe('completeTask', () => {
    it('debería marcar tarea como completed y limpiar activeTask', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

      // Primero guardar un estado
      await persistence.saveState({
        taskId: 'T003',
        currentPhase: 'phase-4',
        currentPhaseId: 'phase-4',
        currentWorkflowId: 'workflow.phase-4',
        isLifecycle: false,
        status: 'running',
        gateResponses: {},
        startedAt: '2026-01-01',
        updatedAt: '2026-01-01',
      });

      await persistence.completeTask('T003');

      const state = await persistence.loadState();
      expect(state).toBeNull(); // activeTask se limpió
    });
  });

  describe('clear', () => {
    it('debería resetear toda la DB', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

      await persistence.saveState({
        taskId: 'T004',
        currentPhase: 'phase-1',
        currentPhaseId: 'phase-1',
        currentWorkflowId: 'workflow.phase-1',
        isLifecycle: false,
        status: 'running',
        gateResponses: {},
        startedAt: '2026-01-01',
        updatedAt: '2026-01-01',
      });

      await persistence.clear();

      const state = await persistence.loadState();
      expect(state).toBeNull();
    });
  });
});
