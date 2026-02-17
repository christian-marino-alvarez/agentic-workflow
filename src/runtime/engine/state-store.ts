import fs from 'node:fs/promises';
import path from 'node:path';
import type { RuntimeState } from './types.js';

export class StateStore {
  constructor(private statePath: string) {}

  public async load(): Promise<RuntimeState | null> {
    try {
      const raw = await fs.readFile(this.statePath, 'utf-8');
      return JSON.parse(raw) as RuntimeState;
    } catch {
      return null;
    }
  }

  public async save(state: RuntimeState): Promise<void> {
    const dir = path.dirname(this.statePath);
    await fs.mkdir(dir, { recursive: true });
    const tempPath = `${this.statePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(state, null, 2));
    await fs.rename(tempPath, this.statePath);
  }
}
