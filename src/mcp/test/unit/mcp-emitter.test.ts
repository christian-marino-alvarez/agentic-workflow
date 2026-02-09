import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { RuntimeEmitter } from '../../emitter.js';
import { RuntimeWriteGuard } from '../../../runtime/write-guard.js';

async function readLines(filePath: string): Promise<string[]> {
  const raw = await fs.readFile(filePath, 'utf-8');
  return raw.split('\n').filter(Boolean);
}

describe('RuntimeEmitter', () => {
  it('does nothing when eventsPath is undefined', async () => {
    const emitter = new RuntimeEmitter();
    await emitter.emit({ type: 'noop', timestamp: new Date().toISOString(), runId: 'x' });
    expect(true).toBe(true);
  });

  it('writes events without write guard', async () => {
    const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-emitter-'));
    const eventsPath = path.join(base, 'nested', 'events.jsonl');
    const emitter = new RuntimeEmitter(eventsPath);
    await emitter.emit({ type: 'plain', timestamp: new Date().toISOString(), runId: 'x' });

    const lines = await readLines(eventsPath);
    expect(lines.some((line) => JSON.parse(line).type === 'plain')).toBe(true);
  });

  it('writes events with write guard', async () => {
    const base = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-emitter-guard-'));
    const runtimeDir = path.join(base, '.agent', 'runtime');
    await fs.mkdir(runtimeDir, { recursive: true });
    const eventsPath = path.join(runtimeDir, 'events.jsonl');
    const guard = new RuntimeWriteGuard({ workspaceRoot: base, actor: 'architect-agent', breakGlass: true });
    const emitter = new RuntimeEmitter(eventsPath, guard);
    await emitter.emit({ type: 'guarded', timestamp: new Date().toISOString(), runId: 'x' });

    const lines = await readLines(eventsPath);
    expect(lines.some((line) => JSON.parse(line).type === 'guarded')).toBe(true);
  });
});
