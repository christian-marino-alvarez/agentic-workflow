import { _electron as electron } from '@playwright/test';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { downloadAndUnzipVSCode } from '@vscode/test-electron';
import { test, expect } from '@serenity-js/playwright-test';
import { actorCalled } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import * as fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('Setup webview should render correctly', async () => {
  const extensionPath = resolve(__dirname, '../../../../../../');
  const vscodePath = await downloadAndUnzipVSCode();

  // Resilient path resolution
  let executablePath = vscodePath;
  if (!vscodePath.endsWith('Electron') && !vscodePath.includes('Electron')) {
    executablePath = resolve(vscodePath, 'Visual Studio Code.app/Contents/MacOS/Electron');
  }

  const userDataDir = resolve(__dirname, '../../../../../../.vscode-test/user-data');
  if (fs.existsSync(userDataDir)) {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }

  // Launch VS Code
  const electronApp = await electron.launch({
    executablePath,
    args: [
      '--extensionDevelopmentPath=' + extensionPath,
      '--user-data-dir=' + userDataDir,
      '--new-window',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-updates',
      '--skip-welcome',
      '--skip-release-notes',
      '--disable-workspace-trust',
    ],
  });

  // Give it a moment to spawn and stabilize
  await new Promise(r => setTimeout(r, 5000));
  const window = await electronApp.firstWindow();

  // Serenity/JS Actor setup
  const actor = actorCalled('Milos')
    .whoCan(BrowseTheWebWithPlaywright.usingPage(window));

  // Wait for the window to be stable
  await window.waitForLoadState('load');

  // Open Setup view with retry
  let setupFound = false;
  for (let i = 0; i < 3; i++) {
    await window.keyboard.press('F1');
    await window.waitForTimeout(500);
    await window.keyboard.type('View: Show Setup');
    await window.keyboard.press('Enter');
    await window.waitForTimeout(3000);

    const count = await window.locator('iframe.webview.ready[src*="christianmaf80"]').count();
    if (count > 0) {
      setupFound = true;
      break;
    }
    console.log(`Retry ${i + 1}: Setup view not found yet...`);
  }

  if (!setupFound) {
    // Attempt to click activity bar as fallback
    try {
      await window.locator('.composite.button[title*="Agent Chat"]').click();
      await window.waitForTimeout(2000);
    } catch (e) {
      console.log('Failed to click activity bar button');
    }
  }
  await window.screenshot({ path: resolve(__dirname, 'vscode-launch-basic.png') });

  // Give some time for the webview to initialize
  await window.waitForTimeout(5000);

  // Take a screenshot of the window for debugging
  await window.screenshot({ path: resolve(__dirname, 'vscode-state.png') });

  // Debug iframes
  const iframeLocators = window.locator('iframe.webview.ready');
  const count = await iframeLocators.count();
  console.log(`Found ${count} ready webviews`);
  for (let i = 0; i < count; i++) {
    const src = await iframeLocators.nth(i).getAttribute('src');
    console.log(`Webview ${i} src: ${src}`);
  }

  // Find the webview iframe (specific to our extension)
  const webview = window.frameLocator('iframe.webview.ready[src*="christianmaf80"]');
  const activeWebview = webview.frameLocator('iframe#active-frame');

  // Locate our Lit element
  const setupView = activeWebview.locator('agw-setup-view');

  // Locate the tabs
  const modelTab = setupView.locator('.tab', { hasText: 'Modelos' });
  const addTab = setupView.locator('.tab', { hasText: 'Añadir' });

  // Final validation using Serenity/JS Actor and PageElement
  await expect(modelTab).toBeVisible();
  await expect(addTab).toBeVisible();
  await expect(addTab).toHaveClass(/active/);

  // Check for form elements in the "Añadir" tab
  await expect(setupView.locator('label', { hasText: 'Nombre del Perfil' })).toBeVisible();
  await expect(setupView.locator('#new-name')).toBeVisible();

  await electronApp.close();
});
