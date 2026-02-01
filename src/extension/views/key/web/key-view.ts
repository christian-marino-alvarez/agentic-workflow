import { html, css } from 'https://unpkg.com/lit@3.2.0/index.js?module';
import { customElement, state } from 'https://unpkg.com/lit@3.2.0/decorators.js?module';
import { AgwViewBase } from '../../../core/webview/agw-view-base.js';

@customElement('agw-setup-view')
export class AgwSetupView extends AgwViewBase {
  @state()
  private message = 'Missing API key. Add one to start chatting.';

  @state()
  private scriptSrc = '';

  @state()
  private scriptNonce = '';

  public static styles = [
    AgwViewBase.styles,
    css`
      .container {
        padding: 16px;
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
      .debug {
        font-size: 12px;
        opacity: 0.6;
        word-break: break-all;
        margin: 4px 0;
      }
      .actions {
        display: flex;
        gap: 8px;
        margin: 8px 0;
      }
    `
  ];

  protected listen(): void {
    window.addEventListener('message', (event) => this.handleMessage(event));
  }

  protected async loadData(): Promise<void> {
    this.scriptSrc = this.getAttribute('data-script-uri') ?? '';
    this.scriptNonce = this.getAttribute('data-nonce') ?? '';
    this.log('info', 'init');
    this.postMessage({ type: 'webview-ready', view: 'keyView' });
    this.status = 'ready';
    this.log('info', 'status-ready');
  }

  private handleMessage(event: MessageEvent): void {
    const type = (event.data as { type?: string })?.type;
    if (type === 'api-key-present') {
      this.message = 'API key saved. You can update or clear it if needed.';
      this.log('info', 'api-key-present');
    }
    if (type === 'api-key-missing') {
      this.message = 'Missing API key. Add one to start chatting.';
      this.log('info', 'api-key-missing');
    }
  }

  private handleSetKey(): void {
    this.log('info', 'click-set-key');
    this.postMessage({ type: 'set-api-key' });
  }

  private handleClearKey(): void {
    this.log('info', 'clear-api-key');
    this.postMessage({ type: 'clear-api-key' });
  }

  private handleLogPing(): void {
    this.log('info', 'log-ping');
  }

  protected renderView() {
    return html`
      <div class="container">
        <h3>API Key</h3>
        <div class="debug">JS status: loaded</div>
        <div class="debug">Script src: ${this.scriptSrc}</div>
        <div class="debug">Nonce: ${this.scriptNonce}</div>
        <div class="actions">
          <button type="button" @click=${this.handleSetKey}>Set API Key</button>
          <button type="button" @click=${this.handleClearKey}>Clear API Key</button>
          <button type="button" @click=${this.handleLogPing}>Log ping</button>
        </div>
        <p>${this.message}</p>
      </div>
    `;
  }
}
