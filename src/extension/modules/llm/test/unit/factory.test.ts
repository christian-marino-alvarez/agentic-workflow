import { expect, describe, it, beforeEach } from 'vitest';
import { LLMFactory } from '../../backend/factory.js';
import * as sinon from 'sinon';

describe('LLMFactory', () => {
  let factory: LLMFactory;

  beforeEach(() => {
    factory = new LLMFactory('/mock/extension/uri');
  });

  it('should throw error if no binding found for role', async () => {
    try {
      await factory.createAgent('unknown-role', {});
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.message).to.include('No model bound for role');
    }
  });

  // Mocking fs and environment variables would be needed for deeper testing
  // For now, testing the factory logic basics
});
