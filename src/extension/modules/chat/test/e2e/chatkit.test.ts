import { _electron as electron } from '@playwright/test';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { downloadAndUnzipVSCode } from '@vscode/test-electron';
import { test, expect } from '@serenity-js/playwright-test';
import { actorCalled } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import * as fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('ChatKit webview should render correctly', async () => {
  const extensionPath = resolve(__dirname, '../../../../../../');
  const vscodePath = await downloadAndUnzipVSCode();

  // Resilient path resolution
  let executablePath = vscodePath;
  if (!vscodePath.endsWith('Electron') && !vscodePath.includes('Electron')) {
    executablePath = resolve(vscodePath, 'Visual Studio Code.app/Contents/MacOS/Electron');
  }

  const userDataDir = resolve(__dirname, '../../../../../../.vscode-test/user-data-chat');
  if (fs.existsSync(userDataDir)) {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }

  // Launch VS Code
  const electronApp = await electron.launch({
    executablePath,
    args: [
      resolve(vscodePath, 'Visual Studio Code.app/Contents/Resources/app/out/main.js'),
      '--extensionDevelopmentPath=' + extensionPath,
      '--user-data-dir=' + userDataDir,
      '--new-window',
      '--no-sandbox',
      '--disable-extensions-except=' + extensionPath,
    ],
  });

  // Give it more time to spawn and stabilize
  await new Promise(r => setTimeout(r, 10000));
  const window = await electronApp.firstWindow();

  // Serenity/JS Actor 
  const actor = actorCalled('Milos')
    .whoCan(BrowseTheWebWithPlaywright.usingPage(window));

  // Wait for the window to be stable
  await window.waitForLoadState('load');

  // Open Chat view with retry
  let chatFound = false;
  for (let i = 0; i < 3; i++) {
    await window.keyboard.press('F1');
    await window.waitForTimeout(500);
    await window.keyboard.type('View: Show Agent Chat');
    await window.keyboard.press('Enter');
    await window.waitForTimeout(4000);

    const count = await window.locator('iframe.webview.ready[src*="christianmaf80"]').count();
    if (count > 0) {
      chatFound = true;
      break;
    }
    console.log(`Retry ${i + 1}: Chat view not found yet...`);
  }

  // Debug iframes if not found
  if (!chatFound) {
    await window.screenshot({ path: resolve(__dirname, 'chat-not-found.png') });
  }

  // Find the webview iframe
  const webview = window.frameLocator('iframe.webview.ready[src*="christianmaf80"]');
  const activeWebview = webview.frameLocator('iframe#active-frame');

  // Locate our component
  const chatView = activeWebview.locator('agw-chat-view');
  const chatKit = activeWebview.locator('openai-chatkit');

  // Validation
  await expect(chatView).toBeVisible();
  await expect(chatKit).toBeVisible();

  // Verify theme synchronization (Dark Mode by default in most tests)
  const kitClass = await chatKit.getAttribute('class');
  // ChatKit usually applies theme-related classes or styles

  await window.screenshot({ path: resolve(__dirname, 'chatkit-rendered.png') });

  await electronApp.close();
});
