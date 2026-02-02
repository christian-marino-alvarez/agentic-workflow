import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/view/base.js';

@customElement('agw-chat-view')
export class View extends AgwViewBase {
  @state()
  private statusText = 'Loading…';

  @state()
  private apiUrl = '';

  @state()
  private isLoading = true;

  @state()
  private showTest = false;
  private pendingInit = false;

  public static styles = [
    AgwViewBase.styles,
    css`
      :host {
        display: block;
        padding: 0 12px 16px;
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin: 12px 0;
      }
      button {
        border: 1px solid var(--vscode-button-border, transparent);
        background: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #ffffff);
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
      }
      button:hover {
        background: var(--vscode-button-hoverBackground, #1177bb);
      }
      #status {
        font-size: 12px;
        opacity: 0.7;
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 120px;
        text-align: center;
        opacity: 0.7;
      }
      .chatkit {
        display: block;
        height: calc(100vh - 90px);
        min-height: 420px;
      }
    `
  ];

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  protected listen(): void {
    window.addEventListener('message', (event) => this.handleMessage(event));
  }

  protected async loadData(): Promise<void> {
    this.apiUrl = document.body?.dataset?.apiUrl ?? '';
    const hasKey = document.body?.dataset?.hasKey === 'true';
    this.log('info', 'init');
    this.postMessage({ type: 'webview-ready', view: 'chatView' });
    if (hasKey) {
      this.pendingInit = true;
      await this.updateComplete;
      void this.initChatKit();
    }
  }

  private async getChatKitElement(): Promise<HTMLElement | null> {
    await this.updateComplete;
    const element = this.querySelector('openai-chatkit');
    return element instanceof HTMLElement ? element : null;
  }

  private async initChatKit(): Promise<void> {
    if (!this.apiUrl) {
      this.statusText = 'Missing API URL.';
      this.isLoading = false;
      this.showTest = false;
      this.log('error', 'missing-api-url');
      return;
    }

    this.isLoading = true;
    this.showTest = false;
    this.log('info', 'chatkit-wait');
    await customElements.whenDefined('openai-chatkit');
    let chatkit = await this.getChatKitElement();
    if (!chatkit) {
      this.requestUpdate();
      await this.updateComplete;
      chatkit = await this.getChatKitElement();
    }
    if (!chatkit) {
      this.statusText = 'ChatKit element not found.';
      this.isLoading = false;
      this.log('error', 'missing-chatkit-element');
      return;
    }

    (chatkit as unknown as { setOptions: (options: unknown) => void }).setOptions({
      apiURL: this.apiUrl,
      api: { url: this.apiUrl, domainKey: 'local-dev' },
      theme: 'light',
      newThreadView: {
        heading: 'Agentic Workflow',
        description: 'Chat con Neo'
      }
    });
    this.statusText = 'Ready';
    this.isLoading = false;
    this.showTest = true;
    this.log('info', 'chatkit-ready');
  }

  private async handleTestClick(): Promise<void> {
    const chatkit = this.querySelector('openai-chatkit') as
      | HTMLElement
      | null;
    if (!chatkit) {
      return;
    }
    this.statusText = 'Sending…';
    this.log('info', 'send-test');
    const timeoutMs = 10000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Tenemos problemas, reintentelo mas tarde'));
      }, timeoutMs);
    });
    try {
      await Promise.race([
        (chatkit as unknown as { sendUserMessage: (payload: unknown) => Promise<void> })
          .sendUserMessage({
            text: 'Hello I am the first agent called Neo',
            newThread: true
          }),
        timeoutPromise
      ]);
      this.statusText = 'Ready';
      this.log('info', 'send-test-ok');
    } catch (error) {
      this.statusText = error instanceof Error ? error.message : 'Tenemos problemas, reintentelo mas tarde';
      this.log('error', 'send-test-error', {
        message: error instanceof Error ? error.message : 'unknown'
      });
    }
  }

  private handleMessage(event: MessageEvent): void {
    const type = (event.data as { type?: string })?.type;
    if (type === 'api-key-missing') {
      this.statusText = 'Missing API key.';
      this.isLoading = false;
      this.showTest = false;
      this.log('info', 'api-key-missing');
      return;
    }
    if (type === 'api-key-present' || type === 'api-key-saved') {
      this.log('info', type);
      if (this.pendingInit) {
        return;
      }
      this.pendingInit = true;
      void this.initChatKit();
    }
  }

  protected renderView() {
    return html`
      <header>
        <div>
          <strong>Agent Chat</strong>
          <div id="status">${this.statusText}</div>
        </div>
        ${this.showTest
          ? html`<button type="button" @click=${this.handleTestClick}>Test</button>`
          : null}
      </header>
      ${this.isLoading ? html`<div class="loading">Loading… [chat]</div>` : null}
      <openai-chatkit class="chatkit"></openai-chatkit>
    `;
  }
}
