import { expect, describe, it, beforeEach } from 'vitest';
import * as sinon from 'sinon';
import { LLMVirtualBackend } from '../../backend/index.js';
import { FastifyInstance } from 'fastify';

describe('LLMVirtualBackend API', () => {
  let backend: LLMVirtualBackend;
  let fastifyStub: any;

  beforeEach(() => {
    fastifyStub = {
      post: sinon.stub(),
      get: sinon.stub(),
    } as any;

    backend = new LLMVirtualBackend({ extensionUri: '/mock/uri' });
    // Manually inject app instance as if register() was called
    (backend as any).app = fastifyStub;
  });

  it('should register RUN and STREAM routes', () => {
    backend.configureRoutes(fastifyStub);
    expect(fastifyStub.post.calledTwice).to.be.true;
    expect(fastifyStub.post.firstCall.args[0]).to.equal('/llm/run');
    expect(fastifyStub.post.secondCall.args[0]).to.equal('/llm/stream');
  });
});
