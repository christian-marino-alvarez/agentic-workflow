import * as vscode from 'vscode';

export class ConfigurationService {
  constructor(private readonly section: string) { }

  get<T>(key: string, defaultValue?: T): T | undefined {
    return vscode.workspace.getConfiguration(this.section).get<T>(key, defaultValue!);
  }

  async update(key: string, value: any, configurationTarget: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global): Promise<void> {
    await vscode.workspace.getConfiguration(this.section).update(key, value, configurationTarget);
  }

  inspect<T>(key: string) {
    return vscode.workspace.getConfiguration(this.section).inspect<T>(key);
  }
}
