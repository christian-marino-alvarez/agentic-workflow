import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve paths relative to this file's location (6 levels deep from project root)
const PROJECT_ROOT = path.resolve(__dirname, '../../../../../..');
const VSCODE_PATH = path.join(
  PROJECT_ROOT,
  '.vscode-test/vscode-darwin-arm64-1.109.3/Visual Studio Code.app/Contents/MacOS/Electron'
);
const USER_DATA_DIR = path.join(PROJECT_ROOT, '.vscode-test/pw-user-data-settings');

let electronApp: ElectronApplication;
let window: Page;

test.setTimeout(60_000);

// ─── Shadow DOM Helper ─────────────────────────────────────
// Since Lit uses Shadow DOM, Playwright locators can't pierce it.
// We use page.evaluate() to traverse: frame → app-view.shadowRoot → settings-view.shadowRoot

/**
 * Finds the webview frame that contains our app-view component.
 */
async function getWebviewFrame(page: Page) {
  // VSCode wraps webviews in iframes with vscode-webview:// URLs
  for (let attempt = 0; attempt < 10; attempt++) {
    const frames = page.frames();
    for (const frame of frames) {
      if (frame.url().startsWith('vscode-webview://')) {
        // Check if this frame has our app-view
        const hasAppView = await frame.evaluate(() => {
          return !!document.querySelector('app-view');
        }).catch(() => false);
        if (hasAppView) {
          return frame;
        }
      }
    }
    await page.waitForTimeout(2000);
  }
  throw new Error('Could not find webview frame with app-view');
}

/**
 * Evaluates a function inside the Settings shadow DOM.
 * The function receives the settings-view's shadowRoot as its context.
 */
async function evalInSettings<T>(page: Page, fn: (shadowRoot: ShadowRoot) => T): Promise<T> {
  const frame = await getWebviewFrame(page);
  return frame.evaluate((fnStr) => {
    const appView = document.querySelector('app-view');
    if (!appView?.shadowRoot) {
      throw new Error('app-view or its shadowRoot not found');
    }
    const settingsView = appView.shadowRoot.querySelector('settings-view');
    if (!settingsView?.shadowRoot) {
      throw new Error('settings-view or its shadowRoot not found');
    }
    // Execute the function with shadowRoot as arg
    const func = new Function('shadowRoot', `return (${fnStr})(shadowRoot)`);
    return func(settingsView.shadowRoot);
  }, fn.toString());
}

/**
 * Clicks the Settings tab in app-view's shadow DOM.
 */
async function switchToSettings(page: Page) {
  const frame = await getWebviewFrame(page);
  await frame.evaluate(() => {
    const appView = document.querySelector('app-view');
    if (!appView?.shadowRoot) {
      throw new Error('app-view shadowRoot not found');
    }
    const tabBtn = appView.shadowRoot.querySelector('button.tab-item');
    // First tab is SETTINGS
    if (tabBtn) {
      (tabBtn as HTMLElement).click();
    }
  });
  // Wait for settings-view to render
  await page.waitForTimeout(2000);
}

/**
 * Waits for settings-view to be present and have content.
 */
async function waitForSettingsReady(page: Page, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const hasContent = await evalInSettings(page, (sr) => {
        // Check for either "Managed Models" header or empty state
        const h2 = sr.querySelector('h2');
        const emptyState = sr.querySelector('.empty-state');
        return !!(h2 || emptyState);
      });
      if (hasContent) {
        return;
      }
    } catch {
      // Not ready yet
    }
    await page.waitForTimeout(1000);
  }
  throw new Error('Settings view did not become ready');
}

// ─── Setup / Teardown ──────────────────────────────────────

test.beforeAll(async () => {
  electronApp = await electron.launch({
    executablePath: VSCODE_PATH,
    args: [
      PROJECT_ROOT,                              // open workspace so roles are discoverable
      '--extensionDevelopmentPath=' + PROJECT_ROOT,
      '--disable-gpu',
      '--no-sandbox',
      '--user-data-dir=' + USER_DATA_DIR,
      '--skip-welcome',
      '--skip-release-notes',
      '--disable-workspace-trust',
    ],
    timeout: 30_000,
  });

  window = await electronApp.firstWindow();
  await window.waitForTimeout(8000);

  // Open the main webview via Command Palette
  await window.keyboard.press('Meta+Shift+P');
  await window.waitForTimeout(500);
  await window.keyboard.type('View: Focus on Agent Chat', { delay: 30 });
  await window.waitForTimeout(500);
  await window.keyboard.press('Enter');
  await window.waitForTimeout(5000);

  // Switch to Settings tab
  await switchToSettings(window);

  // Wait for Settings to fully load (skeleton → list/empty)
  await waitForSettingsReady(window);
});

test.afterAll(async () => {
  try {
    await electronApp?.close();
  } catch {
    // Force kill if graceful close fails
    const pid = electronApp?.process()?.pid;
    if (pid) {
      process.kill(pid, 'SIGKILL');
    }
  }
});

// ─── Tests ─────────────────────────────────────────────────

test.describe.serial('Settings Module E2E', () => {

  test('Render: Should show Settings content', async () => {
    const content = await evalInSettings(window, (sr) => {
      const h2 = sr.querySelector('h2');
      const emptyState = sr.querySelector('.empty-state');
      return {
        hasHeader: !!h2,
        headerText: h2?.textContent?.trim() || '',
        hasEmptyState: !!emptyState,
      };
    });

    // Either we see "Managed Models" header or the empty state
    expect(content.hasHeader || content.hasEmptyState).toBe(true);
    if (content.hasHeader) {
      expect(content.headerText).toContain('Managed Models');
    }

    await window.screenshot({ path: path.join(PROJECT_ROOT, '.vscode-test/pw-settings-01-render.png') });
  });

  test('Add Model: Should create a new model', async () => {
    // Click "Add" button (could be in header-actions or empty-state)
    await evalInSettings(window, (sr) => {
      // Try header "Add new model" button first
      const addBtn = sr.querySelector('button[title="Add new model"]') as HTMLElement;
      if (addBtn) {
        addBtn.click();
        return;
      }
      // Fallback: empty state "Add Model" button
      const centeredBtn = sr.querySelector('.add-btn-centered') as HTMLElement;
      if (centeredBtn) {
        centeredBtn.click();
        return;
      }
      throw new Error('No add button found');
    });

    await window.waitForTimeout(1000);

    // Verify form is visible
    const hasForm = await evalInSettings(window, (sr) => {
      return !!sr.querySelector('form');
    });
    expect(hasForm).toBe(true);

    // Fill form fields
    await evalInSettings(window, (sr) => {
      const nameInput = sr.querySelector('input[name="name"]') as HTMLInputElement;
      if (nameInput) {
        nameInput.value = 'E2E Test Model';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const providerSelect = sr.querySelector('select[name="provider"]') as HTMLSelectElement;
      if (providerSelect) {
        providerSelect.value = 'gemini';
        providerSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const apiKeyInput = sr.querySelector('input[name="apiKey"]') as HTMLInputElement;
      if (apiKeyInput) {
        apiKeyInput.value = 'test-api-key-e2e';
        apiKeyInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Submit form
    await evalInSettings(window, (sr) => {
      const submitBtn = sr.querySelector('button[type="submit"]') as HTMLElement;
      if (submitBtn) {
        submitBtn.click();
      }
    });

    // Wait for list to reload (LOADING → LIST transition)
    await window.waitForTimeout(3000);
    await waitForSettingsReady(window);

    // Verify the model appears in the list
    const modelExists = await evalInSettings(window, (sr) => {
      const cards = sr.querySelectorAll('.model-card');
      for (const card of cards) {
        const name = card.querySelector('.model-name')?.textContent?.trim();
        if (name === 'E2E Test Model') {
          return true;
        }
      }
      return false;
    });
    expect(modelExists).toBe(true);

    await window.screenshot({ path: path.join(PROJECT_ROOT, '.vscode-test/pw-settings-02-added.png') });
  });

  test('Edit Model: Should update model name', async () => {
    // Click Edit on "E2E Test Model"
    await evalInSettings(window, (sr) => {
      const cards = sr.querySelectorAll('.model-card');
      for (const card of cards) {
        const name = card.querySelector('.model-name')?.textContent?.trim();
        if (name === 'E2E Test Model') {
          const editBtn = card.querySelector('.action-btn.edit') as HTMLElement;
          if (editBtn) {
            editBtn.click();
          }
          return;
        }
      }
      throw new Error('Model card "E2E Test Model" not found');
    });

    await window.waitForTimeout(1000);

    // Verify form is pre-filled
    const prefilled = await evalInSettings(window, (sr) => {
      const nameInput = sr.querySelector('input[name="name"]') as HTMLInputElement;
      return nameInput?.value || '';
    });
    expect(prefilled).toBe('E2E Test Model');

    // Update name
    await evalInSettings(window, (sr) => {
      const nameInput = sr.querySelector('input[name="name"]') as HTMLInputElement;
      if (nameInput) {
        nameInput.value = 'E2E Model Updated';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Submit
    await evalInSettings(window, (sr) => {
      const submitBtn = sr.querySelector('button[type="submit"]') as HTMLElement;
      if (submitBtn) {
        submitBtn.click();
      }
    });

    await window.waitForTimeout(3000);
    await waitForSettingsReady(window);

    // Verify updated name
    const updatedExists = await evalInSettings(window, (sr) => {
      const cards = sr.querySelectorAll('.model-card');
      for (const card of cards) {
        const name = card.querySelector('.model-name')?.textContent?.trim();
        if (name === 'E2E Model Updated') {
          return true;
        }
      }
      return false;
    });
    expect(updatedExists).toBe(true);

    await window.screenshot({ path: path.join(PROJECT_ROOT, '.vscode-test/pw-settings-03-edited.png') });
  });

  test('Delete Model: Should remove the model', async () => {
    // Click Delete on "E2E Model Updated" (first click = pending)
    await evalInSettings(window, (sr) => {
      const cards = sr.querySelectorAll('.model-card');
      for (const card of cards) {
        const name = card.querySelector('.model-name')?.textContent?.trim();
        if (name === 'E2E Model Updated') {
          const deleteBtn = card.querySelector('.action-btn.delete') as HTMLElement;
          if (deleteBtn) {
            deleteBtn.click();
          }
          return;
        }
      }
      throw new Error('Model card "E2E Model Updated" not found for delete');
    });

    await window.waitForTimeout(500);

    // Verify confirm state: button should now say "Confirm"
    const confirmText = await evalInSettings(window, (sr) => {
      const cards = sr.querySelectorAll('.model-card');
      for (const card of cards) {
        const name = card.querySelector('.model-name')?.textContent?.trim();
        if (name === 'E2E Model Updated') {
          const deleteBtn = card.querySelector('.action-btn.delete');
          return deleteBtn?.textContent?.trim() || '';
        }
      }
      return '';
    });
    expect(confirmText).toBe('Confirm');

    // Click again to confirm delete
    await evalInSettings(window, (sr) => {
      const cards = sr.querySelectorAll('.model-card');
      for (const card of cards) {
        const name = card.querySelector('.model-name')?.textContent?.trim();
        if (name === 'E2E Model Updated') {
          const deleteBtn = card.querySelector('.action-btn.delete.confirm-delete') as HTMLElement;
          if (deleteBtn) {
            deleteBtn.click();
          }
          return;
        }
      }
    });

    await window.waitForTimeout(3000);
    await waitForSettingsReady(window);

    // Verify model is gone
    const modelGone = await evalInSettings(window, (sr) => {
      const cards = sr.querySelectorAll('.model-card');
      for (const card of cards) {
        const name = card.querySelector('.model-name')?.textContent?.trim();
        if (name === 'E2E Model Updated') {
          return false;
        }
      }
      return true;
    });
    expect(modelGone).toBe(true);

    await window.screenshot({ path: path.join(PROJECT_ROOT, '.vscode-test/pw-settings-04-deleted.png') });
  });

});

// ─── Agents Section Tests ───────────────────────────────────

test.describe.serial('Settings Module E2E - Agents Section', () => {

  test('Agents: Should render the Agents section with role cards', async () => {
    const result = await evalInSettings(window, (sr) => {
      const section = sr.querySelector('.role-binding-section');
      const h2 = section?.querySelector('h2');
      const cards = sr.querySelectorAll('.role-binding-section .model-card');
      return {
        hasSectionHeader: h2?.textContent?.trim() === 'Agents',
        cardCount: cards.length,
        firstRoleName: cards[0]?.querySelector('.model-name')?.textContent?.trim() || '',
      };
    });

    expect(result.hasSectionHeader).toBe(true);
    expect(result.cardCount).toBeGreaterThan(0);
    expect(result.firstRoleName.length).toBeGreaterThan(0);

    await window.screenshot({ path: path.join(PROJECT_ROOT, '.vscode-test/pw-settings-05-agents-list.png') });
  });

  test('Agents: Each card should have a power button and a model selector', async () => {
    const result = await evalInSettings(window, (sr) => {
      const cards = sr.querySelectorAll('.role-binding-section .model-card');
      const checks: { role: string; hasPowerBtn: boolean; hasSelect: boolean }[] = [];
      for (const card of cards) {
        checks.push({
          role: card.querySelector('.model-name')?.textContent?.trim() || '',
          hasPowerBtn: !!card.querySelector('.power-btn'),
          hasSelect: !!card.querySelector('select.select-input'),
        });
      }
      return checks;
    });

    expect(result.length).toBeGreaterThan(0);
    for (const check of result) {
      expect(check.hasPowerBtn).toBe(true);
      expect(check.hasSelect).toBe(true);
    }
  });

  test('Agents: Power button first click should enter pending state', async () => {
    // Get the first role name
    const firstRole = await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      return card?.querySelector('.model-name')?.textContent?.trim() || '';
    });
    expect(firstRole.length).toBeGreaterThan(0);

    // Click the power button once
    await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      const btn = card?.querySelector('.power-btn') as HTMLElement;
      btn?.click();
    });

    await window.waitForTimeout(500);

    // Verify pending state: button should have class "pending" and show label text
    const pendingState = await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      const btn = card?.querySelector('.power-btn');
      const label = card?.querySelector('.power-btn-label');
      return {
        isPending: btn?.classList.contains('pending') ?? false,
        labelText: label?.textContent?.trim() || '',
      };
    });

    expect(pendingState.isPending).toBe(true);
    expect(pendingState.labelText).toMatch(/Deactivate\?|Activate\?/);

    await window.screenshot({ path: path.join(PROJECT_ROOT, '.vscode-test/pw-settings-06-agent-pending.png') });
  });

  test('Agents: Power button second click should deactivate the agent', async () => {
    // Click again to confirm deactivation
    await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      const btn = card?.querySelector('.power-btn.pending') as HTMLElement;
      btn?.click();
    });

    await window.waitForTimeout(500);

    // Verify disabled state: card should have "disabled" class, select should be disabled
    const disabledState = await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      const select = card?.querySelector('select.select-input') as HTMLSelectElement;
      const btn = card?.querySelector('.power-btn');
      return {
        cardIsDisabled: card?.classList.contains('disabled') ?? false,
        selectIsDisabled: select?.disabled ?? false,
        btnIsOff: btn?.classList.contains('off') ?? false,
      };
    });

    expect(disabledState.cardIsDisabled).toBe(true);
    expect(disabledState.selectIsDisabled).toBe(true);
    expect(disabledState.btnIsOff).toBe(true);

    await window.screenshot({ path: path.join(PROJECT_ROOT, '.vscode-test/pw-settings-07-agent-disabled.png') });
  });

  test('Agents: Power button should re-activate the agent (two-click confirm)', async () => {
    // First click on disabled agent — enters pending state for activation
    await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card.disabled');
      const btn = card?.querySelector('.power-btn.off') as HTMLElement;
      btn?.click();
    });

    await window.waitForTimeout(500);

    // Verify pending state shows "Activate?"
    const pendingLabel = await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      return card?.querySelector('.power-btn-label')?.textContent?.trim() || '';
    });
    expect(pendingLabel).toBe('Activate?');

    // Second click — confirm activation
    await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      const btn = card?.querySelector('.power-btn.pending') as HTMLElement;
      btn?.click();
    });

    await window.waitForTimeout(500);

    // Verify re-activated: card should NOT have "disabled" class
    const reactivated = await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      const select = card?.querySelector('select.select-input') as HTMLSelectElement;
      return {
        cardIsDisabled: card?.classList.contains('disabled') ?? false,
        selectIsDisabled: select?.disabled ?? false,
      };
    });

    expect(reactivated.cardIsDisabled).toBe(false);
    expect(reactivated.selectIsDisabled).toBe(false);

    await window.screenshot({ path: path.join(PROJECT_ROOT, '.vscode-test/pw-settings-08-agent-reactivated.png') });
  });

  test('Agents: Pending state should auto-cancel after timeout', async () => {
    // Click power button once to enter pending state
    await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      const btn = card?.querySelector('.power-btn') as HTMLElement;
      btn?.click();
    });

    await window.waitForTimeout(500);

    // Verify pending
    const isPending = await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      return card?.querySelector('.power-btn.pending') !== null;
    });
    expect(isPending).toBe(true);

    // Wait for auto-cancel (3s timeout + buffer)
    await window.waitForTimeout(3500);

    // Verify pending state is gone
    const isStillPending = await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      return card?.querySelector('.power-btn.pending') !== null;
    });
    expect(isStillPending).toBe(false);

    await window.screenshot({ path: path.join(PROJECT_ROOT, '.vscode-test/pw-settings-09-agent-autocancelled.png') });
  });

  test('Agents: Model selector should bind a model to a role', async () => {
    // Get first card's role name and available options
    const roleInfo = await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      const role = card?.querySelector('.model-name')?.textContent?.trim() || '';
      const select = card?.querySelector('select.select-input') as HTMLSelectElement;
      const options = Array.from(select?.options || []).map(o => ({ value: o.value, text: o.text }));
      return { role, options };
    });

    // Only test binding if there are models available
    if (roleInfo.options.length <= 1) {
      // No models to bind — skip gracefully
      console.log('No models available to test binding, skipping');
      return;
    }

    // Select the first non-empty option
    const targetOption = roleInfo.options.find(o => o.value !== '');
    if (!targetOption) { return; }

    await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      const select = card?.querySelector('select.select-input') as HTMLSelectElement;
      if (select && select.options.length > 1) {
        select.value = select.options[1].value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await window.waitForTimeout(1000);

    // Verify the selection persisted in the UI
    const selectedValue = await evalInSettings(window, (sr) => {
      const card = sr.querySelector('.role-binding-section .model-card');
      const select = card?.querySelector('select.select-input') as HTMLSelectElement;
      return select?.value || '';
    });

    expect(selectedValue).not.toBe('');

    await window.screenshot({ path: path.join(PROJECT_ROOT, '.vscode-test/pw-settings-10-agent-binding.png') });
  });

});

