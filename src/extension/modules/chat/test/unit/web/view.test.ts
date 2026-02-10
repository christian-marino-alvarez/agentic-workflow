import { describe, it, expect, vi } from 'vitest';
import { html } from 'lit';
import { renderMain } from '../../../web/templates/main/html/index.js';

describe('ChatView Template Logic', () => {
  it('renderMain renders openai-chatkit when initialized', () => {
    const template = renderMain({
      environment: 'dev',
      models: [],
      modelId: 'test-model',
      onSend: vi.fn(),
      onModelChange: vi.fn(),
      onAcceptProposal: vi.fn(),
      onRejectProposal: vi.fn(),
      isInitialized: true
    });

    // We expect the template to contain the openai-chatkit tag
    const templateString = JSON.stringify(template);
    expect(templateString).toContain('openai-chatkit');
  });

  it('shows loading state when not initialized', () => {
    const template = renderMain({
      environment: 'dev',
      models: [],
      modelId: 'test-model',
      onSend: vi.fn(),
      onModelChange: vi.fn(),
      onAcceptProposal: vi.fn(),
      onRejectProposal: vi.fn(),
      isInitialized: false
    });

    const templateString = JSON.stringify(template);
    expect(templateString).toContain('Cargando ChatKit...');
  });
});
