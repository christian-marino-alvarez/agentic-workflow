import { AbstractBackend } from '../../core/backend/index.js';

/**
 * App Module Backend Server.
 * Runs in the Sidecar process.
 */
export class AppServer extends AbstractBackend {
  constructor() {
    super('app', { name: 'AppSidecar' });
  }

  protected async handleCommand(command: string, data: any): Promise<any> {
    console.log(`[AppSidecar] Handling Command: ${command}`, JSON.stringify(data));

    if (command === 'ping') {
      return { pong: true, timestamp: Date.now() };
    }

    return { success: true, message: 'Command received', command };
  }
}

// Auto-start the server when this file is executed
new AppServer().start();
