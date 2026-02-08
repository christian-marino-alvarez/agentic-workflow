// Check Node.js version in VS Code Extension Host
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Node.js version in Extension Host:', process.version);
  console.log('Node.js versions:', process.versions);

  vscode.window.showInformationMessage(
    `Extension Host Node.js: ${process.version}`
  );
}

export function deactivate() { }
