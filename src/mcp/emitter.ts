import fs from 'node:fs/promises';
import path from 'node:path';
import type { RuntimeWriteGuard } from '../runtime/write-guard.js';

export type RuntimeEvent = {
  type: string;
  timestamp: string;
  runId: string;
  phase?: string;
  payload?: Record<string, unknown>;
};

export class RuntimeEmitter {
  constructor(private eventsPath?: string, private writeGuard?: RuntimeWriteGuard) {}

  async emit(event: RuntimeEvent): Promise<void> {
    if (!this.eventsPath) {
      return;
    }
    const filePath = path.resolve(this.eventsPath);
    const payload = `${JSON.stringify(event)}\n`;
    if (this.writeGuard) {
      await this.writeGuard.appendFile(filePath, payload);
      return;
    }
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.appendFile(filePath, payload, 'utf-8');
  }
}
