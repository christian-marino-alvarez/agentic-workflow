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
// Reuse user-data dir but handle sidebar toggle properly
const USER_DATA_DIR = path.resolve(__dirname, '../../../../../../.vscode-test/pw-user-data');

let electronApp: ElectronApplication;
let window: Page;

test.setTimeout(60_000);

test.beforeAll(async () => {
  electronApp = await electron.launch({
    executablePath: VSCODE_PATH,
    args: [
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

  // Open sidebar using keyboard shortcut for Command Palette
  // Then execute the focus command for our view
  await window.keyboard.press('Meta+Shift+P');
  await window.waitForTimeout(500);
  await window.keyboard.type('View: Focus on Agent Chat View', { delay: 30 });
  await window.waitForTimeout(500);
  await window.keyboard.press('Enter');
  await window.waitForTimeout(3000);
});

test.afterAll(async () => {
  const pid = electronApp.process().pid;
  if (pid) process.kill(pid, 'SIGKILL');
});

// ─── Helpers ───────────────────────────────────────────────

async function getContentFrame(page: Page) {
  for (let attempt = 0; attempt < 8; attempt++) {
    // Try VS Code webview iframe selectors
    for (const sel of ['iframe.webview.ready', 'iframe.webview']) {
      try {
        const outer = page.frameLocator(sel).first();
        const inner = outer.frameLocator('#active-frame');
        const h1 = inner.locator('h1');
        if (await h1.isVisible({ timeout: 1500 })) {
          return inner;
        }
      } catch { /* next */ }
    }

    // Fallback: search all frames
    for (const frame of page.frames()) {
      try {
        const h1 = frame.locator('h1');
        if (await h1.isVisible({ timeout: 500 })) {
          const text = await h1.textContent();
          if (text?.includes('Agentic')) return frame;
        }
      } catch { /* skip */ }
    }

    const iframeCount = await page.$$eval('iframe', els => els.length);
    console.log(`Retry ${attempt + 1}/8 — ${iframeCount} iframes`);
    await page.waitForTimeout(2000);
  }
  throw new Error('Could not find webview content frame');
}

// ─── Tests ─────────────────────────────────────────────────

test.describe.serial('App E2E', () => {

  test('Extension activates in Development Host', async () => {
    const title = await window.title();
    console.log('Window title:', title);
    expect(title).toContain('Visual Studio Code');
    await window.screenshot({ path: '.vscode-test/pw-01-initial.png' });
  });

  test('Webview renders with correct content', async () => {
    const frame = await getContentFrame(window);

    const heading = frame.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10_000 });
    expect(await heading.textContent()).toContain('Agentic Workflow App');

    await expect(frame.locator('text=Status: Active')).toBeVisible();
    await expect(frame.locator('text=Last Pong:')).toBeVisible();
    await expect(frame.locator('button', { hasText: 'Ping Backend' })).toBeVisible();

    await window.screenshot({ path: '.vscode-test/pw-02-webview.png' });
  });

  test('Ping receives Pong response', async () => {
    const frame = await getContentFrame(window);

    const pongP = frame.locator('p', { hasText: 'Last Pong:' });
    const before = await pongP.textContent();
    console.log('Before ping:', before);

    await frame.locator('button', { hasText: 'Ping Backend' }).click();
    console.log('Clicked Ping Backend');

    await expect(async () => {
      const after = await pongP.textContent();
      expect(after).not.toContain('Last Pong: -');
    }).toPass({ timeout: 15_000 });

    const after = await pongP.textContent();
    console.log('After ping:', after);
    await window.screenshot({ path: '.vscode-test/pw-03-pong.png' });
  });

  test('Multiple pings resolve correctly', async () => {
    const frame = await getContentFrame(window);
    const btn = frame.locator('button', { hasText: 'Ping Backend' });

    await btn.click();
    await btn.click();
    await btn.click();
    console.log('Fired 3 rapid pings');

    await expect(async () => {
      const t = await btn.textContent();
      expect(t).not.toContain('pending');
    }).toPass({ timeout: 15_000 });

    const pong = await frame.locator('p', { hasText: 'Last Pong:' }).textContent();
    console.log('Final pong:', pong);
    expect(pong).not.toContain('Last Pong: -');

    await window.screenshot({ path: '.vscode-test/pw-04-multi.png' });
  });
});
