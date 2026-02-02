import fs from 'node:fs/promises';
import path from 'node:path';
import type { RuntimeEvent } from './types.js';

export interface RuntimeEmitterOptions {
  eventsPath?: string;
  stdout?: boolean;
}

export class RuntimeEmitter {
  private eventsPath?: string;
  private stdoutEnabled: boolean;

  constructor(options: RuntimeEmitterOptions = {}) {
    this.eventsPath = options.eventsPath;
    this.stdoutEnabled = options.stdout ?? true;
  }

  public async emit(event: RuntimeEvent): Promise<void> {
    if (this.stdoutEnabled) {
      await this.writeToStdout(event);
    }
    await this.writeToFile(event);
  }

  private async writeToStdout(event: RuntimeEvent): Promise<void> {
    process.stdout.write(`${JSON.stringify(event)}\n`);
  }

  private async writeToFile(event: RuntimeEvent): Promise<void> {
    if (!this.eventsPath) {
      return;
    }
    await this.ensureEventsDir(this.eventsPath);
    await fs.appendFile(this.eventsPath, `${JSON.stringify(event)}\n`);
  }

  private async ensureEventsDir(eventsPath: string): Promise<void> {
    await fs.mkdir(path.dirname(eventsPath), { recursive: true });
  }
}
