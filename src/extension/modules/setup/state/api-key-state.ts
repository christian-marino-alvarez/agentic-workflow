import { EventEmitter, type Disposable } from 'vscode';
import type { ApiKeyState } from '../types.d.ts';

export class ApiKeyBroadcaster implements Disposable {
  private emitter = new EventEmitter<ApiKeyState>();
  private state: ApiKeyState = 'missing';

  public readonly onDidChange = this.emitter.event;

  public notify(state: ApiKeyState): void {
    this.state = state;
    this.emitter.fire(state);
  }

  public getState(): ApiKeyState {
    return this.state;
  }

  public dispose(): void {
    this.emitter.dispose();
  }
}

export type { ApiKeyState } from '../types.d.ts';
