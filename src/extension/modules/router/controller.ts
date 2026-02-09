import type { Disposable, ExtensionContext } from 'vscode';
import { commands } from 'vscode';
import type { ApiKeyBroadcaster, ApiKeyState } from '../security/background/state/index.js';

export type ViewHandle = {
  show: (preserveFocus?: boolean) => void;
};

export type ModuleRegistration<TDomain, TArgs extends unknown[] = []> = {
  register: (context: ExtensionContext, ...args: TArgs) => TDomain | Promise<TDomain>;
};

export class ModuleRouter implements Disposable {
  private readonly disposables: Disposable[] = [];

  public constructor(private readonly context: ExtensionContext) { }

  public async register<TDomain, TArgs extends unknown[]>(
    module: ModuleRegistration<TDomain, TArgs>,
    ...args: TArgs
  ): Promise<TDomain> {
    return await module.register(this.context, ...args);
  }

  public connectChat(apiKeyBroadcaster: ApiKeyBroadcaster, chatView: ViewHandle): void {
    const disposable = apiKeyBroadcaster.onDidChange((state: ApiKeyState) => {
      if (state === 'present') {
        void this.openChat(chatView);
      }
    });
    this.disposables.push(disposable);
  }

  private async openChat(chatView: ViewHandle): Promise<void> {
    try {
      const available = await commands.getCommands(true);
      if (available.includes('chatView.focus')) {
        await commands.executeCommand('chatView.focus');
      }
      chatView.show(true);
    } catch {
      chatView.show(true);
    }
  }

  public dispose(): void {
    while (this.disposables.length > 0) {
      const disposable = this.disposables.pop();
      disposable?.dispose();
    }
  }
}
