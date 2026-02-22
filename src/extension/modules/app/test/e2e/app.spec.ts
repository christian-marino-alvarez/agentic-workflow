import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VSCODE_PATH = path.resolve(
  __dirname,
  '../../../../../../.vscode-test/vscode-darwin-arm64-1.109.3/Visual Studio Code.app/Contents/MacOS/Electron'
);
const EXTENSION_PATH = path.resolve(__dirname, '../../../../../..');
const USER_DATA_DIR = path.resolve(__dirname, '../../../../../../.vscode-test/pw-user-data');

let electronApp: ElectronApplication;
let window: Page;

test.setTimeout(60_000);

test.beforeAll(async () => {
  electronApp = await electron.launch({
    executablePath: VSCODE_PATH,
    args: [
      EXTENSION_PATH,
      '--extensionDevelopmentPath=' + EXTENSION_PATH,
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
  await window.keyboard.type('View: Focus on Agentic Workflow', { delay: 30 });
  await window.waitForTimeout(500);
  await window.keyboard.press('Enter');
  await window.waitForTimeout(5000);
});

test.afterAll(async () => {
  const pid = electronApp?.process()?.pid;
  if (pid) {
    process.kill(pid, 'SIGKILL');
  }
});

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
    console.log(`Retry ${attempt + 1}/10 — ${frames.length} frames`);
    await page.waitForTimeout(2000);
  }
  throw new Error('Could not find webview frame with app-view');
}

async function evalInApp<T>(page: Page, fn: (shadowRoot: ShadowRoot) => T): Promise<T> {
  const frame = await getWebviewFrame(page);
  return frame.evaluate((fnStr) => {
    const appView = document.querySelector('app-view');
    if (!appView?.shadowRoot) {
      throw new Error('app-view or its shadowRoot not found');
    }
    const func = new Function('shadowRoot', `return (${fnStr})(shadowRoot)`);
    return func(appView.shadowRoot);
  }, fn.toString());
}

test.describe.serial('App E2E', () => {

  test('Extension activates in Development Host', async () => {
    const title = await window.title();
    console.log('Window title:', title);
    expect(title.length).toBeGreaterThan(0);
    await window.screenshot({ path: '.vscode-test/pw-01-initial.png' });
  });

  test('Webview renders with tab navigation', async () => {
    const tabs = await evalInApp(window, (sr) => {
      const buttons = sr.querySelectorAll('.tab-item');
      return Array.from(buttons).map(b => b.textContent?.trim() || '');
    });

    expect(tabs).toContain('SETTINGS');
    expect(tabs).toContain('CHAT');
    expect(tabs).toContain('HISTORY');

    await window.screenshot({ path: '.vscode-test/pw-02-tabs.png' });
  });

  test('Chat tab is active by default', async () => {
    const activeTab = await evalInApp(window, (sr) => {
      const active = sr.querySelector('.tab-item.active');
      return active?.textContent?.trim() || '';
    });

    expect(activeTab).toBe('CHAT');

    const hasChatView = await evalInApp(window, (sr) => {
      return !!sr.querySelector('chat-view');
    });
    expect(hasChatView).toBe(true);

    await window.screenshot({ path: '.vscode-test/pw-03-chat-default.png' });
  });

  test('Can switch to Settings tab', async () => {
    await evalInApp(window, (sr) => {
      const buttons = sr.querySelectorAll('.tab-item');
      for (const btn of buttons) {
        if (btn.textContent?.trim() === 'SETTINGS') {
          (btn as HTMLElement).click();
          return;
        }
      }
    });

    await window.waitForTimeout(1500);

    const activeTab = await evalInApp(window, (sr) => {
      const active = sr.querySelector('.tab-item.active');
      return active?.textContent?.trim() || '';
    });
    expect(activeTab).toBe('SETTINGS');

    const hasSettingsView = await evalInApp(window, (sr) => {
      return !!sr.querySelector('settings-view');
    });
    expect(hasSettingsView).toBe(true);

    await window.screenshot({ path: '.vscode-test/pw-04-settings-tab.png' });
  });

  test('Can switch to History tab', async () => {
    await evalInApp(window, (sr) => {
      const buttons = sr.querySelectorAll('.tab-item');
      for (const btn of buttons) {
        if (btn.textContent?.trim() === 'HISTORY') {
          (btn as HTMLElement).click();
          return;
        }
      }
    });

    await window.waitForTimeout(1500);

    const activeTab = await evalInApp(window, (sr) => {
      const active = sr.querySelector('.tab-item.active');
      return active?.textContent?.trim() || '';
    });
    expect(activeTab).toBe('HISTORY');

    const hasHistoryContent = await evalInApp(window, (sr) => {
      return !!sr.querySelector('.history-container');
    });
    expect(hasHistoryContent).toBe(true);

    await window.screenshot({ path: '.vscode-test/pw-05-history-tab.png' });
  });
});
