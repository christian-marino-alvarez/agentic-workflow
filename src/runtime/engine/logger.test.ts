
import { describe, it, expect, beforeEach } from 'vitest';
import { Logger } from './logger.js';

describe('Logger', () => {
  beforeEach(() => {
    Logger.getInstance().clear();
  });

  it('should be a singleton', () => {
    const instance1 = Logger.getInstance();
    const instance2 = Logger.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should store logs in buffer', () => {
    Logger.info('Test', 'Mesage 1');
    const logs = Logger.getInstance().getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].message).toBe('Mesage 1');
    expect(logs[0].level).toBe('info');
  });

  it('should respect max logs limit (circular buffer)', () => {
    const MAX = 1000;
    for (let i = 0; i < MAX + 10; i++) {
      Logger.info('Test', `Log ${i}`);
    }

    const logs = Logger.getInstance().getLogs(MAX + 100); // Request more than max to check true size
    expect(logs.length).toBe(MAX);
    expect(logs[logs.length - 1].message).toBe(`Log ${MAX + 9}`);
    expect(logs[0].message).toBe(`Log 10`); // Log 0-9 evicted
  });

  it('should retrieve limited logs', () => {
    Logger.info('Test', '1');
    Logger.info('Test', '2');
    Logger.info('Test', '3');

    const logs = Logger.getInstance().getLogs(2);
    expect(logs.length).toBe(2);
    expect(logs[0].message).toBe('2');
    expect(logs[1].message).toBe('3');
  });
});
