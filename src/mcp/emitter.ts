import fs from 'node:fs/promises';
import path from 'node:path';

export type RuntimeEvent = {
  type: string;
  timestamp: string;
  runId: string;
  phase?: string;
  payload?: Record<string, unknown>;
};

export class RuntimeEmitter {
  constructor(private eventsPath?: string) {}

  async emit(event: RuntimeEvent): Promise<void> {
    if (!this.eventsPath) {
      return;
    }
    const filePath = path.resolve(this.eventsPath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.appendFile(filePath, `${JSON.stringify(event)}\n`, 'utf-8');
  }
}
