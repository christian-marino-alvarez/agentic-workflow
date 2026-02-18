// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Settings as SettingsView } from '../view/index.js';
import { ViewState, SCOPES, MESSAGES } from '../constants.js';

// We don't import backend or vscode here to avoid node/jsdom conflicts

describe('Settings Module View', () => {
  let view: SettingsView;

  beforeEach(() => {
    // Instantiate directly to ensure private fields (accessors) are initialized
    // Requires jsdom environment (provided by comment above)
    view = new SettingsView();

    // Mock methods that might interact with VSCode or expensive logic
    // Use any cast to access protected members for test setup
    (view as any).log = vi.fn();
    (view as any).sendMessage = vi.fn().mockResolvedValue({});
    view.requestUpdate = vi.fn();
  });

  it('userActionAdded switches to FORM state', () => {
    view.userActionAdded();
    expect(view.viewState).toBe(ViewState.FORM);
    expect(view.editingModel).toBeUndefined();
  });

  it('userActionEdited selects model and switches to FORM', () => {
    const mockModel = { id: '1', name: 'M1', provider: 'p1', authType: 'key' } as any;
    view.models = [mockModel];

    view.userActionEdited('1');

    expect(view.viewState).toBe(ViewState.FORM);
    expect(view.editingModel).toBe(mockModel);
  });

  it('userActionRefresh loads models', async () => {
    (view as any).sendMessage.mockResolvedValue({ models: [], activeModelId: undefined });

    await view.userActionRefresh();

    expect(view.viewState).toBe(ViewState.LIST);
    // userActionRefresh sets LOADING, loadModels finishes with LIST (if successful or error)

    expect((view as any).sendMessage).toHaveBeenCalledWith(SCOPES.BACKGROUND, MESSAGES.GET_REQUEST);
  });

  it('userActionDeleted sends delete request after confirmation', async () => {
    const id = 'del-1';

    // First call: pending logic
    await view.userActionDeleted(id);
    expect(view.pendingDeleteId).toBe(id);
    expect((view as any).sendMessage).not.toHaveBeenCalledWith(SCOPES.BACKGROUND, MESSAGES.DELETE_REQUEST, id);

    // Second call: confirm logic
    await view.userActionDeleted(id);
    expect(view.pendingDeleteId).toBeUndefined();
    expect((view as any).sendMessage).toHaveBeenCalledWith(SCOPES.BACKGROUND, MESSAGES.DELETE_REQUEST, id);
  });

});
