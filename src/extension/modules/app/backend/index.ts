import { AbstractBackend } from '../../core/backend/index.js';

import { NAME } from '../constants.js';

/**
 * App Module Backend Server.
 * Runs in the Sidecar process.
 */
export class AppServer extends AbstractBackend {
  constructor() {
    super(NAME, { name: 'AppSidecar' });
  }

  protected async listen(command: string, data: any): Promise<any> {
    console.log(`[AppSidecar] Handling Command: ${command}`, JSON.stringify(data));
    return { success: true, message: 'Command received', command };
  }
}

// Auto-start the server when this file is executed
new AppServer().start();
