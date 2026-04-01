/**
 * WorkflowPersistence
 *
 * Lowdb-based state store for XState workflow snapshots.
 * Stores workflow execution state as JSON files in the workspace.
 *
 * Design: Pure code, zero native dependencies.
 * File location: .agent/artifacts/<taskId>/workflow-state.json
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { PATHS } from '../constants.js';
import type { WorkflowEngineState, WorkflowStateDB } from '../types.js';

const DEFAULT_DB: WorkflowStateDB = {
  version: 1,
  activeTask: null,
  states: {},
  lastUpdated: new Date().toISOString(),
};

// ─── Persistence Class ────────────────────────────────────────

export class WorkflowPersistence {
  private dbPath: string;
  private db: WorkflowStateDB | null = null;

  constructor(workspaceRoot: string) {
    this.dbPath = join(workspaceRoot, PATHS.STATE_FILE);
  }

  // ─── Read / Write ─────────────────────────────────────────

  /**
   * Load the database from disk.
   */
  async load(): Promise<WorkflowStateDB> {
    if (this.db) {
      return this.db;
    }

    try {
      const content = await readFile(this.dbPath, 'utf-8');
      this.db = JSON.parse(content) as WorkflowStateDB;
    } catch {
      // File doesn't exist or is corrupted — start fresh
      this.db = { ...DEFAULT_DB };
    }

    return this.db;
  }

  /**
   * Write the database to disk atomically.
   */
  private async write(): Promise<void> {
    if (!this.db) {
      return;
    }

    this.db.lastUpdated = new Date().toISOString();

    try {
      // Ensure directory exists
      const dir = dirname(this.dbPath);
      await mkdir(dir, { recursive: true });

      // Write atomically: write to temp file, then rename
      const tmpPath = `${this.dbPath}.tmp`;
      await writeFile(tmpPath, JSON.stringify(this.db, null, 2), 'utf-8');

      // Rename is atomic on most filesystems
      const { rename } = await import('node:fs/promises');
      await rename(tmpPath, this.dbPath);
    } catch {
      // Non-blocking: persistence failure shouldn't crash the engine
    }
  }

  // ─── State Operations ─────────────────────────────────────

  /**
   * Save a workflow engine state.
   */
  async saveState(state: WorkflowEngineState): Promise<void> {
    await this.load();
    this.db!.states[state.taskId] = state;
    this.db!.activeTask = state.taskId;
    await this.write();
  }

  /**
   * Load the most recent workflow state.
   */
  async loadState(): Promise<WorkflowEngineState | null> {
    const db = await this.load();
    if (!db.activeTask) {
      return null;
    }
    return db.states[db.activeTask] ?? null;
  }

  /**
   * Load a state for a specific task.
   */
  async loadTaskState(taskId: string): Promise<WorkflowEngineState | null> {
    const db = await this.load();
    return db.states[taskId] ?? null;
  }

  /**
   * Set the active task.
   */
  async setActiveTask(taskId: string): Promise<void> {
    await this.load();
    this.db!.activeTask = taskId;
    await this.write();
  }

  /**
   * Mark a task as completed and clear active task.
   */
  async completeTask(taskId: string): Promise<void> {
    await this.load();
    const state = this.db!.states[taskId];
    if (state) {
      state.status = 'completed';
      state.updatedAt = new Date().toISOString();
    }
    if (this.db!.activeTask === taskId) {
      this.db!.activeTask = null;
    }
    await this.write();
  }

  /**
   * Get all stored states.
   */
  async getAllStates(): Promise<Record<string, WorkflowEngineState>> {
    const db = await this.load();
    return db.states;
  }

  /**
   * Clear all state (for testing or reset).
   */
  async clear(): Promise<void> {
    this.db = { ...DEFAULT_DB };
    await this.write();
  }
}
