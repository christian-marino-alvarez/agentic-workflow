import path from 'node:path';
import fs from 'node:fs/promises';
import { ensureString } from './runtimeParams.js';

export async function handleGetState(params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const statePath = ensureString(params.statePath, 'statePath');
  const rawState = await fs.readFile(path.resolve(statePath), 'utf-8');
  const state = JSON.parse(rawState);

  let taskContent = '';
  try {
    if (state.taskPath) {
      taskContent = await fs.readFile(state.taskPath, 'utf-8');
    }
  } catch {
    // Ignore if task file not found
  }

  return { ...state, taskContent };
}
