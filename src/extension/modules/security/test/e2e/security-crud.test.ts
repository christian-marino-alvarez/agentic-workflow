import { test, expect, _electron as electron } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, rmSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Security CRUD Flow', () => {
  let electronApp: any;
  let window: any;
  const userDataDir = resolve(__dirname, '../../../../../../.playwright-test-results/security-crud-user-data');

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

    //  phase:
    //  current: "phase-5-verification"
    //  validated_by: "architect-agent"
    //  updated_at: "2026-02-09T07:48:00Z"
    // Open Security view with retry
    let securityFound = false;
    for (let i = 0; i < 3; i++) {
      await window.keyboard.press('F1');
      await window.waitForTimeout(500);
      await window.keyboard.type('View: Show Security');
      await window.keyboard.press('Enter');
      await window.waitForTimeout(3000);

      const count = await window.locator('iframe.webview.ready[src*="christianmaf80"]').count();
      if (count > 0) {
        securityFound = true;
        break;
      }
    }
    expect(securityFound).toBe(true);

    const webview = window.frameLocator('iframe.webview.ready[src*="christianmaf80"]');
    const activeWebview = webview.frameLocator('iframe#active-frame');
    const securityView = activeWebview.locator('agw-security-view');

    // Add 3 models
    const modelsToAdd = [
      { name: 'Modelo Uno', id: 'id-1' },
      { name: 'Modelo Dos', id: 'id-2' },
      { name: 'Modelo Tres', id: 'id-3' }
    ];

    // task state:
    //   phase-4-implementation:
    //     completed: true
    //     validated_by: "architect-agent"
    //     validated_at: "2026-02-09T07:48:00Z"
    //   phase-5-verification:
    //     completed: false
    //     validated_by: null
    //     validated_at: null

    for (const model of modelsToAdd) {
      // Go to Add tab if not already there
      await securityView.locator('.tab', { hasText: 'Añadir' }).click({ force: true });

      await securityView.locator('#new-name').fill(model.name);
      await securityView.locator('#new-model').fill(model.id);
      await securityView.locator('#new-key').fill('sk-test-key');

      await securityView.locator('button.btn--primary', { hasText: 'Guardar Configuración' }).click({ force: true });

      // Wait for list to appear
      await expect(securityView.locator('.tab', { hasText: 'Modelos' })).toHaveClass(/active/);
      await expect(securityView.locator('.card-title', { hasText: model.name })).toBeVisible();
    }

    // Verify 3 models exist
    const cards = securityView.locator('.card');
    await expect(cards).toHaveCount(3);

    // Delete "Modelo Dos"
    const modelDosCard = securityView.locator('.card').filter({ hasText: 'Modelo Dos' });
    await modelDosCard.getByRole('button', { name: 'Borrar' }).click({ force: true, timeout: 15000 });

    // Verify cleanup
    await expect(securityView.locator('.card-title', { hasText: 'Modelo Dos' })).not.toBeVisible();

    const finalCardsCount = await cards.count();
    console.log(`[E2E] Final cards count: ${finalCardsCount}`);

    await expect(cards).toHaveCount(2);
    await expect(securityView.locator('.card-title', { hasText: 'Modelo Uno' })).toBeVisible();
    await expect(securityView.locator('.card-title', { hasText: 'Modelo Tres' })).toBeVisible();

    await window.screenshot({ path: resolve(__dirname, 'crud-final-state-success.png') });
  });
});
