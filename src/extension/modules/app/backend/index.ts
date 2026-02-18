import { AbstractBackend } from '../../core/backend/index.js';
import { LLMVirtualBackend } from '../../llm/backend/index.js';

import { NAME } from '../constants.js';

/**
 * App Module Backend Server.
 * Runs in the Sidecar process.
 */
export class AppServer extends AbstractBackend {
  constructor() {
    super(NAME, { name: 'AppSidecar' });
  }

  // Override start to register virtual backends
  public override async start(): Promise<void> {
    // Register LLM Module
    const llm = new LLMVirtualBackend({
      extensionUri: process.env.EXTENSION_URI || process.cwd()
    });

    // Register LLM Module
    await llm.register(this.server);

    await super.start();
  }

  protected async listen(command: string, data: any): Promise<any> {
    console.log(`[AppSidecar] Handling Command: ${command}`, JSON.stringify(data));
    return { success: true, message: 'Command received', command };
  }
}

// Auto-start the server when this file is executed
new AppServer().start();
