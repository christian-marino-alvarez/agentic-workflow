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
const USER_DATA_DIR = path.join(PROJECT_ROOT, '.vscode-test/pw-user-data-chat');

let electronApp: ElectronApplication;
let window: Page;

test.setTimeout(60_000);

// ─── Helpers ─────────────────────────────────────

async function getWebviewFrame(page: Page) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const frames = page.frames();
    for (const frame of frames) {
      if (frame.url().startsWith('vscode-webview://')) {
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

async function evalInChat<T>(page: Page, fn: (shadowRoot: ShadowRoot) => T): Promise<T> {
  const frame = await getWebviewFrame(page);
  return frame.evaluate((fnStr) => {
    const appView = document.querySelector('app-view');
    if (!appView?.shadowRoot) {
      throw new Error('app-view or its shadowRoot not found');
    }
    const chatView = appView.shadowRoot.querySelector('chat-view');
    if (!chatView?.shadowRoot) {
      throw new Error('chat-view or its shadowRoot not found: is the tab active?');
    }
    const func = new Function('shadowRoot', `return (${fnStr})(shadowRoot)`);
    return func(chatView.shadowRoot);
  }, fn.toString());
}

async function switchToChat(page: Page) {
  const frame = await getWebviewFrame(page);
  await frame.evaluate(() => {
    const appView = document.querySelector('app-view');
    if (!appView?.shadowRoot) {
      throw new Error('app-view shadowRoot not found');
    }
    const buttons = Array.from(appView.shadowRoot.querySelectorAll('button.tab-item'));
    const chatBtn = buttons.find(b => b.textContent?.trim() === 'CHAT');
    if (chatBtn) {
      (chatBtn as HTMLElement).click();
    } else {
      throw new Error('Chat tab button not found');
    }
  });
  await page.waitForTimeout(2000);
}

// ─── Setup / Teardown ──────────────────────────────────────

test.beforeAll(async () => {
  electronApp = await electron.launch({
    executablePath: VSCODE_PATH,
    args: [
      PROJECT_ROOT,
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

  // Switch to Chat tab
  await switchToChat(window);
});

test.afterAll(async () => {
  await electronApp?.close().catch(() => { });
});

// ─── Tests ─────────────────────────────────────────────────

test.describe('Chat Module E2E', () => {

  test('Render: Should show Chat Interface', async () => {
    const content = await evalInChat(window, (sr) => {
      const h2 = sr.querySelector('h2');
      return h2?.textContent?.trim();
    });
    expect(content).toBe('RUNTIME CHAT'); // Uppercase from CSS
  });

  test('Send Message: Should display sent message in history', async () => {
    const testMessage = 'fs.read test-file.txt';

    // Type message
    await evalInChat(window, (sr) => {
      const input = sr.querySelector('input.input-control') as HTMLInputElement;
      if (input) {
        input.value = 'fs.read test-file.txt';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        throw new Error('Input not found');
      }
    });

    // Click Send
    await evalInChat(window, (sr) => {
      const btn = sr.querySelector('button.btn-primary') as HTMLElement;
      if (btn) btn.click();
      else throw new Error('Send button not found');
    });

    await window.waitForTimeout(1000);

    // Verify history update
    const history = await evalInChat(window, (sr) => {
      const bubbles = Array.from(sr.querySelectorAll('.msg-bubble'));
      return bubbles.map(b => b.textContent?.trim());
    });

    expect(history).toContain(testMessage);
  });
});
