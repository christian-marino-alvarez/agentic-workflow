import { describe, it, expect } from 'vitest';
import * as runtimeIndex from '../../index.js';

describe('runtime index', () => {
  it('exports Runtime and task resolver', () => {
    expect(runtimeIndex).toHaveProperty('Runtime');
    expect(runtimeIndex).toHaveProperty('resolveTaskPath');
    expect(runtimeIndex).toHaveProperty('__runtimeIndexLoaded', true);
  });
});
