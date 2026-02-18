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
  const pid = electronApp?.process()?.pid;
  if (pid) {
    process.kill(pid, 'SIGKILL');
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
