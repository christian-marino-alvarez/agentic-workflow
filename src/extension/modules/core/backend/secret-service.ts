import * as vscode from 'vscode';

export class SecretStorageService {
  constructor(private readonly secretStorage: vscode.SecretStorage) { }

  async get(key: string): Promise<string | undefined> {
    return this.secretStorage.get(key);
  }

  async store(key: string, value: string): Promise<void> {
    await this.secretStorage.store(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.secretStorage.delete(key);
  }
}
