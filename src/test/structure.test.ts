
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

suite('Structure Test Suite', () => {
  test('Governance files exist', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return; // Skip if no workspace
    }
    const rootPath = workspaceFolders[0].uri.fsPath;

    // Check .agent/index.md
    const agentIndex = path.join(rootPath, '.agent', 'index.md');
    assert.ok(fs.existsSync(agentIndex), '.agent/index.md should exist');

    // Check src/agentic-system-structure/index.md
    const srcIndex = path.join(rootPath, 'src', 'agentic-system-structure', 'index.md');
    assert.ok(fs.existsSync(srcIndex), 'src/agentic-system-structure/index.md should exist');

    // Check key roles
    const backendRole = path.join(rootPath, '.agent', 'rules', 'roles', 'backend.md');
    assert.ok(fs.existsSync(backendRole), 'backend.md role should exist');
  });
});
