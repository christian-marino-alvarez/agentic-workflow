import { test, expect, _electron as electron } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, rmSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Setup CRUD Flow', () => {
  let electronApp: any;
  let window: any;
  const userDataDir = resolve(__dirname, '../../../../../../.playwright-test-results/setup-crud-user-data');

  test.beforeAll(async () => {
    // Clean state
    if (existsSync(userDataDir)) {
      rmSync(userDataDir, { recursive: true, force: true });
    }
    mkdirSync(userDataDir, { recursive: true });

    electronApp = await electron.launch({
      executablePath: resolve(__dirname, '../../../../../../.vscode-test/vscode-darwin-arm64-1.109.0/Visual Studio Code.app/Contents/MacOS/Electron'),
      args: [
        '--user-data-dir=' + userDataDir,
        '--extensionDevelopmentPath=' + resolve(__dirname, '../../../../../../'),
        '--disable-extensions-except=' + resolve(__dirname, '../../../../../../'),
        '--no-sandbox',
        '--disable-gpu',
      ],
    });
    window = await electronApp.firstWindow();
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('Debe permitir crear 3 modelos y borrar uno de la lista', async () => {
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
    }
    expect(setupFound).toBe(true);

    const webview = window.frameLocator('iframe.webview.ready[src*="christianmaf80"]');
    const activeWebview = webview.frameLocator('iframe#active-frame');
    const setupView = activeWebview.locator('agw-setup-view');

    // Add 3 models
    const modelsToAdd = [
      { name: 'Modelo Uno', id: 'id-1' },
      { name: 'Modelo Dos', id: 'id-2' },
      { name: 'Modelo Tres', id: 'id-3' }
    ];

    for (const model of modelsToAdd) {
      // Go to Add tab if not already there
      await setupView.locator('.tab', { hasText: 'Añadir' }).click();

      await setupView.locator('#new-name').fill(model.name);
      await setupView.locator('#new-model').fill(model.id);
      await setupView.locator('#new-key').fill('sk-test-key');

      await setupView.locator('button.btn--primary', { hasText: 'Guardar Configuración' }).click();

      // Wait for list to appear
      await expect(setupView.locator('.tab', { hasText: 'Modelos' })).toHaveClass(/active/);
      await expect(setupView.locator('.card-title', { hasText: model.name })).toBeVisible();
    }

    // Verify 3 models exist
    const cards = setupView.locator('.card');
    await expect(cards).toHaveCount(3);

    // Delete "Modelo Dos"
    const modelDosCard = setupView.locator('.card', { has: window.locator('.card-title', { hasText: 'Modelo Dos' }) });
    await modelDosCard.locator('button.btn--danger', { hasText: 'Borrar' }).click();

    // Verify cleanup
    await expect(cards).toHaveCount(2);
    await expect(setupView.locator('.card-title', { hasText: 'Modelo Dos' })).not.toBeVisible();
    await expect(setupView.locator('.card-title', { hasText: 'Modelo Uno' })).toBeVisible();
    await expect(setupView.locator('.card-title', { hasText: 'Modelo Tres' })).toBeVisible();

    await window.screenshot({ path: resolve(__dirname, 'crud-final-state.png') });
  });
});
