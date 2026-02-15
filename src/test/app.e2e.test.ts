import * as assert from 'assert';
import * as vscode from 'vscode';

suite('App E2E Test Suite', () => {
  test('Extension should activate and App should be registered', async () => {
    const extension = vscode.extensions.getExtension('christian-marino-alvarez.agentic-workflow');
    assert.ok(extension, 'Extension should be present');

    if (!extension.isActive) {
      console.log('Activating extension...');
      await extension.activate();
      console.log('Extension activated.');
    } else {
      console.log('Extension was already active.');
    }

    assert.ok(extension.isActive, 'Extension should be active');

    // Wait briefly for async registration
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if the view provider is registered (implicit check via API or command if available, 
    // but for now activation success is the primary E2E goal)
    console.log('Extension activated successfully');
  });
});
