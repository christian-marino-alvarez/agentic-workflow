import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileSystemPersistence } from '../../../../backend/agents/persistence.js';
import fs from 'fs/promises';
import path from 'path';

describe('FileSystemPersistence', () => {
  // Use a temporary directory for matching tests
  const testDir = path.resolve(process.cwd(), '.runtime_test_sessions');
  let persistence: FileSystemPersistence;

  beforeEach(async () => {
    persistence = new FileSystemPersistence(testDir);
    // Ensure clean state
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch { }
  });

  afterEach(async () => {
    // Cleanup
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch { }
  });

  it('should save and load a session', async () => {
    const sessionId = 'test-session-1';
    const state = JSON.stringify({ key: 'value', turn: 1 });

    await persistence.saveSession(sessionId, state);

    const loaded = await persistence.loadSession(sessionId);
    expect(loaded).toBe(state);
  });

  it('should return null for non-existent session', async () => {
    const loaded = await persistence.loadSession('non-existent');
    expect(loaded).toBeNull();
  });

  it('should overwrite existing session', async () => {
    const sessionId = 'test-session-2';
    const state1 = 'state1';
    const state2 = 'state2';

    await persistence.saveSession(sessionId, state1);
    let loaded = await persistence.loadSession(sessionId);
    expect(loaded).toBe(state1);

    await persistence.saveSession(sessionId, state2);
    loaded = await persistence.loadSession(sessionId);
    expect(loaded).toBe(state2);
  });

  it('should list sessions', async () => {
    await persistence.saveSession('session-a', 'data');
    await persistence.saveSession('session-b', 'data');

    const sessions = await persistence.listSessions();
    expect(sessions).toContain('session-a');
    expect(sessions).toContain('session-b');
    expect(sessions.length).toBe(2);
  });

  it('should delete a session', async () => {
    await persistence.saveSession('to-delete', 'data');
    await persistence.deleteSession('to-delete');

    const loaded = await persistence.loadSession('to-delete');
    expect(loaded).toBeNull();
  });
});
