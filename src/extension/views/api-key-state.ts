import { EventEmitter, type Disposable } from 'vscode';

export type ApiKeyState = 'missing' | 'present';

export class ApiKeyBroadcaster implements Disposable {
  private emitter = new EventEmitter<ApiKeyState>();

  public readonly onDidChange = this.emitter.event;

  public notify(state: ApiKeyState): void {
    this.emitter.fire(state);
  }

  public dispose(): void {
    this.emitter.dispose();
  }
}
