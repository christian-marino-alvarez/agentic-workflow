import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { RuntimeEmitter } from '../../../engine/emitter.js';
import type { RuntimeEvent } from '../../../engine/types.js';
import { Logger } from '../../../engine/logger.js';
import { ensureString, getOptionalString } from './runtimeParams.js';

export async function handleEmitEvent(params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const eventsPath = getOptionalString(params.eventsPath);
  const event = params.event as RuntimeEvent | undefined;
  if (!event) {
    throw new Error('Missing event payload.');
  }
  const emitter = new RuntimeEmitter({ eventsPath, stdout: false });
  await emitter.emit(event);
  return { status: 'ok' };
}

export async function handleChat(params: Record<string, unknown>): Promise<CallToolResult> {
  const eventsPath = getOptionalString(params.eventsPath);
  const message = ensureString(params.message, 'message');
  const role = getOptionalString(params.role) ?? 'user';

  Logger.info('Runtime', `Chat message received from ${role}`, { message });

  const emitter = new RuntimeEmitter({ eventsPath, stdout: false });
  await emitter.emit({
    type: 'chat_message',
    timestamp: new Date().toISOString(),
    runId: 'chat',
    payload: { role, content: message }
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ status: 'ok' })
      }
    ]
  };
}
