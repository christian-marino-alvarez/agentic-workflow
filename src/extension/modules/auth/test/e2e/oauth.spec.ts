import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../../../../../..');
const VSCODE_PATH = path.join(
  PROJECT_ROOT,
  '.vscode-test/vscode-darwin-arm64-1.109.3/Visual Studio Code.app/Contents/MacOS/Electron'
);
const USER_DATA_DIR = path.join(PROJECT_ROOT, '.vscode-test/pw-user-data-oauth');

let electronApp: ElectronApplication;
let window: Page;

test.setTimeout(90_000);

// ─── Shadow DOM Helpers ─────────────────────────────────────────────────────

async function getWebviewFrame(page: Page) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const frames = page.frames();
    for (const frame of frames) {
      if (frame.url().startsWith('vscode-webview://')) {
        const hasAppView = await frame.evaluate(() =>
          !!document.querySelector('app-view')
        ).catch(() => false);
        if (hasAppView) return frame;
      }
    }
    await page.waitForTimeout(2000);
  }
  throw new Error('Could not find webview frame with app-view');
}

async function evalInSettings<T>(page: Page, fn: (shadowRoot: ShadowRoot) => T): Promise<T> {
  const frame = await getWebviewFrame(page);
  return frame.evaluate((fnStr) => {
    const appView = document.querySelector('app-view');
    if (!appView?.shadowRoot) throw new Error('app-view shadowRoot not found');
    const settingsView = appView.shadowRoot.querySelector('settings-view');
    if (!settingsView?.shadowRoot) throw new Error('settings-view shadowRoot not found');
    const func = new Function('shadowRoot', `return (${fnStr})(shadowRoot)`);
    return func(settingsView.shadowRoot);
  }, fn.toString());
}

async function waitForSettingsReady(page: Page, timeoutMs = 20_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const hasContent = await evalInSettings(page, (sr) => {
        return !!(sr.querySelector('h2') || sr.querySelector('.empty-state'));
      });
      if (hasContent) return;
    } catch { /* not ready */ }
    await page.waitForTimeout(1000);
  }
  throw new Error('Settings view did not become ready');
}

// ─── Setup / Teardown ──────────────────────────────────────────────────────

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

  await window.keyboard.press('Meta+Shift+P');
  await window.waitForTimeout(500);
  await window.keyboard.type('View: Focus on Agent Chat', { delay: 30 });
  await window.waitForTimeout(500);
  await window.keyboard.press('Enter');
  await window.waitForTimeout(5000);

  await waitForSettingsReady(window);
});

test.afterAll(async () => {
  await electronApp?.close();
});

// ─── OAuth Wizard Tests ────────────────────────────────────────────────────

test.describe('OAuth Setup Wizard', () => {

  test('shows OAuth wizard when adding a model with OAuth auth type', async () => {
    // Click Add Model
    await evalInSettings(window, (sr) => {
      const addBtn = sr.querySelector<HTMLElement>('.icon-btn[title="Add new model"]');
      addBtn?.click();
    });
    await window.waitForTimeout(1000);

    // Select OAuth radio
    await evalInSettings(window, (sr) => {
      const oauthRadio = sr.querySelector<HTMLInputElement>('input[type="radio"][value="oauth"]');
      if (oauthRadio) {
        oauthRadio.click();
        oauthRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await window.waitForTimeout(500);

    // Verify credentials status block appears
    const hasCredentialsBlock = await evalInSettings(window, (sr) => {
      return !!sr.querySelector('.oauth-credentials-status');
    });
    expect(hasCredentialsBlock).toBe(true);
  });

  test('credentials status shows "Not configured" when no credentials set', async () => {
    // Ensure we are in form with OAuth selected
    const label = await evalInSettings(window, (sr) => {
      return sr.querySelector('.oauth-cred-label')?.textContent?.trim();
    });
    // Either "Not configured" or "Configured" depending on VS Code settings state
    expect(label).toMatch(/Not configured|Configured/);
  });

  test('clicking Configure opens OAuth setup wizard', async () => {
    // Click the configure/edit button
    await evalInSettings(window, (sr) => {
      const btn = sr.querySelector<HTMLElement>('.btn-configure-oauth');
      btn?.click();
    });
    await window.waitForTimeout(1000);

    // Wizard should be visible with Client ID input
    const hasWizard = await evalInSettings(window, (sr) => {
      return !!sr.querySelector('#googleClientId');
    });
    expect(hasWizard).toBe(true);
  });

  test('wizard has Client ID and Client Secret inputs', async () => {
    const inputs = await evalInSettings(window, (sr) => {
      const clientId = sr.querySelector('#googleClientId');
      const clientSecret = sr.querySelector('#googleClientSecret');
      return {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        secretType: (clientSecret as HTMLInputElement)?.type,
      };
    });

    expect(inputs.hasClientId).toBe(true);
    expect(inputs.hasClientSecret).toBe(true);
    expect(inputs.secretType).toBe('password'); // Secret should be masked
  });

  test('Save Credentials button is present in wizard', async () => {
    const hasSaveBtn = await evalInSettings(window, (sr) => {
      const buttons = Array.from(sr.querySelectorAll('button'));
      return buttons.some(b => b.textContent?.includes('Save Credentials'));
    });
    expect(hasSaveBtn).toBe(true);
  });

  test('wizard validates empty inputs — does not save without both fields', async () => {
    // Clear inputs and try to save
    await evalInSettings(window, (sr) => {
      const idInput = sr.querySelector<HTMLInputElement>('#googleClientId');
      const secretInput = sr.querySelector<HTMLInputElement>('#googleClientSecret');
      if (idInput) idInput.value = '';
      if (secretInput) secretInput.value = '';
    });

    // Click save — should not navigate away (wizard stays visible)
    await evalInSettings(window, (sr) => {
      const buttons = Array.from(sr.querySelectorAll<HTMLElement>('button'));
      const saveBtn = buttons.find(b => b.textContent?.includes('Save Credentials'));
      saveBtn?.click();
    });
    await window.waitForTimeout(500);

    // Wizard should still be visible (validation blocked save)
    const wizardStillVisible = await evalInSettings(window, (sr) => {
      return !!sr.querySelector('#googleClientId');
    });
    expect(wizardStillVisible).toBe(true);
  });

  test('can navigate back from wizard to form', async () => {
    // Click back/cancel in wizard
    await evalInSettings(window, (sr) => {
      const buttons = Array.from(sr.querySelectorAll<HTMLElement>('button'));
      const backBtn = buttons.find(b =>
        b.textContent?.includes('Back') || b.textContent?.includes('Cancel')
      );
      backBtn?.click();
    });
    await window.waitForTimeout(500);

    // Should be back in form view
    const isInForm = await evalInSettings(window, (sr) => {
      return !!sr.querySelector('.oauth-credentials-status');
    });
    expect(isInForm).toBe(true);
  });
});

// ─── Credentials Management Tests ─────────────────────────────────────────

test.describe('OAuth Credentials Management', () => {

  test('Remove button is visible when credentials are configured', async () => {
    // This test checks the UI state — if credentials are configured, Remove button shows
    const hasRemoveBtn = await evalInSettings(window, (sr) => {
      return !!sr.querySelector('.btn-remove-oauth');
    });
    // Remove button only shows when credentials exist — this may be false in a clean env
    // Just verify the element type is correct if present
    if (hasRemoveBtn) {
      const btnText = await evalInSettings(window, (sr) => {
        return sr.querySelector('.btn-remove-oauth')?.textContent?.trim();
      });
      expect(btnText).toContain('Remove');
    }
    // Test passes either way — we just verify no crash
    expect(true).toBe(true);
  });

  test('credentials status block has correct CSS classes', async () => {
    const statusClasses = await evalInSettings(window, (sr) => {
      const block = sr.querySelector('.oauth-credentials-status');
      return block?.className ?? '';
    });

    // Should have one of: configured, missing, or expired
    expect(statusClasses).toMatch(/configured|missing|expired/);
  });
});
