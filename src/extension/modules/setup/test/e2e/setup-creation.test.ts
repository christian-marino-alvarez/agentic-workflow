import { _electron as electron } from '@playwright/test';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { downloadAndUnzipVSCode } from '@vscode/test-electron';
import { test, expect } from '@serenity-js/playwright-test';
import { actorCalled } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import * as fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('Debe permitir crear un nuevo modelo y mostrarlo en la lista', async () => {
  const extensionPath = resolve(__dirname, '../../../../../../');
  const vscodePath = await downloadAndUnzipVSCode();

  // Resilient path resolution
  let executablePath = vscodePath;
  if (!vscodePath.endsWith('Electron') && !vscodePath.includes('Electron')) {
    executablePath = resolve(vscodePath, 'Visual Studio Code.app/Contents/MacOS/Electron');
  }

  // Use a fresh user data dir for this test to ensure "zero models" state
  const userDataDir = resolve(__dirname, '../../../../../../.vscode-test/user-data-creation-test');
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

  await new Promise(r => setTimeout(r, 5000));
  const window = await electronApp.firstWindow();
  window.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  // Setup Serenity/JS
  const actor = actorCalled('Milos')
    .whoCan(BrowseTheWebWithPlaywright.usingPage(window));

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

  // Take a screenshot of the window for debugging
  await window.screenshot({ path: resolve(__dirname, 'vscode-launch.png') });

  // Debug iframes
  const iframeLocators = window.locator('iframe.webview.ready');
  const count = await iframeLocators.count();
  console.log(`Found ${count} ready webviews`);
  for (let i = 0; i < count; i++) {
    const src = await iframeLocators.nth(i).getAttribute('src');
    console.log(`Webview ${i} src: ${src}`);
  }

  const webview = window.frameLocator('iframe.webview.ready[src*="christianmaf80"]');
  const activeWebview = webview.frameLocator('iframe#active-frame');
  const setupView = activeWebview.locator('agw-setup-view');

  // Verify we are in the "Añadir" tab (auto-redirect should work)
  const addTab = setupView.locator('.tab', { hasText: 'Añadir' });
  await expect(addTab).toHaveClass(/active/);

  // Fill the form
  const modelName = 'Modelo de Prueba E2E';
  await setupView.locator('#new-name').fill(modelName);
  await setupView.locator('#new-model').fill('gpt-4o-test');
  await setupView.locator('#new-key').fill('sk-test-mock-key');

  // Click Save
  await setupView.locator('button', { hasText: 'Guardar Configuración' }).click();

  // Wait for redirect to list
  await window.waitForTimeout(2000);

  // Verify "Modelos" tab is now active
  const modelTab = setupView.locator('.tab', { hasText: 'Modelos' });
  await expect(modelTab).toHaveClass(/active/);

  // Verify the new model is in the list
  const cardTitle = setupView.locator('.card-title', { hasText: modelName });
  await expect(cardTitle).toBeVisible();

  // Verify key status
  const statusBadge = setupView.locator('.status-badge', { hasText: 'Conectado' });
  await expect(statusBadge).toBeVisible();

  await electronApp.close();
});
