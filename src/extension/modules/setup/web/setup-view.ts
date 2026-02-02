import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/view/base.js';

@customElement('agw-setup-view')
export class View extends AgwViewBase {
  @state()
  private keyState: 'unknown' | 'present' | 'missing' = 'unknown';
  @state()
  private isLoading = false;
  private loadingTimer?: number;
  private loadingStartedAt?: number;
  private readonly minInitialLoadingMs = 500;


  public static styles = [
    AgwViewBase.styles,
    css`
      .container {
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 140px;
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
      .actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        justify-content: center;
        align-items: center;
        margin: 0;
      }
      .buttons {
        display: flex;
        gap: 8px;
        flex-direction: row;
        align-items: center;
        justify-content: center;
      }
      .intro {
        text-align: center;
        max-width: 280px;
      }
      .intro-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 6px;
      }
      .intro-text {
        font-size: 12px;
        opacity: 0.8;
        line-height: 1.4;
      }
      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 140px;
      }
      .spinner {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid var(--vscode-editorHoverWidget-border, #c7c7c7);
        border-top-color: var(--vscode-button-background, #0e639c);
        animation: spin 0.9s linear infinite;
      }
      .loading-text {
        font-size: 12px;
        opacity: 0.8;
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `
  ];

  protected listen(): void {
    window.addEventListener('message', (event) => this.handleMessage(event));
  }

  protected async loadData(): Promise<void> {
    this.setLoading(true);
    this.log('info', 'init', { human: 'Inicializando vista de configuración' });
    this.postMessage({ type: 'webview-ready', view: 'keyView' });
  }

  private handleMessage(event: MessageEvent): void {
    const type = (event.data as { type?: string })?.type;
    if (type === 'api-key-saved') {
      this.updateKeyState('present');
      this.setLoading(true);
      this.log('info', 'api-key-saved', { human: 'API key guardada, iniciando carga' });
    }
    if (type === 'api-key-present') {
      this.updateKeyState('present');
      this.setLoading(false);
      this.log('info', 'api-key-present', { human: 'API key detectada' });
    }
    if (type === 'api-key-missing') {
      this.updateKeyState('missing');
      this.setLoading(false);
      this.log('info', 'api-key-missing', { human: 'Falta la API key' });
    }
  }

  private updateKeyState(state: 'unknown' | 'present' | 'missing'): void {
    if (this.keyState === state) {
      return;
    }
    this.keyState = state;
    this.requestUpdate();
  }

  private setLoading(value: boolean): void {
    if (this.isLoading === value) {
      return;
    }
    this.isLoading = value;
    if (value) {
      this.loadingStartedAt = Date.now();
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
      }
      this.loadingTimer = window.setTimeout(() => {
        this.isLoading = false;
        this.requestUpdate();
      }, 2200);
      return;
    }
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = undefined;
    }
    if (this.loadingStartedAt) {
      const elapsed = Date.now() - this.loadingStartedAt;
      if (elapsed < this.minInitialLoadingMs) {
        this.loadingTimer = window.setTimeout(() => {
          this.isLoading = false;
          this.requestUpdate();
        }, this.minInitialLoadingMs - elapsed);
        return;
      }
    }
    this.requestUpdate();
  }

  private handleSetKey(): void {
    this.log('info', 'click-set-key', { human: 'Click en Set API Key' });
    this.postMessage({ type: 'set-api-key' });
  }

  private handleClearKey(): void {
    this.log('info', 'clear-api-key', { human: 'Click en Clear API Key' });
    this.postMessage({ type: 'clear-api-key' });
  }

  private handleGoChat(): void {
    this.log('info', 'go-chat', { human: 'Click en Ir a chat' });
    this.postMessage({ type: 'go-chat' });
  }

  protected renderView() {
    if (this.isLoading || this.keyState === 'unknown') {
      return html`
        <div class="loading">
          <div class="spinner" aria-hidden="true"></div>
          <div class="loading-text">Cargando…</div>
        </div>
      `;
    }
    return html`
      <div class="container">
        <div class="actions">
          ${this.keyState === 'present'
            ? html`
                <div class="intro">
                  <div class="intro-title">API Key configurada</div>
                  <div class="intro-text">
                    La clave está configurada. Puedes limpiarla o abrir el chat.
                  </div>
                </div>
                <div class="buttons">
                  <button type="button" @click=${this.handleClearKey}>Clear API Key</button>
                  <button type="button" @click=${this.handleGoChat}>Ir a Chat</button>
                </div>
              `
            : html`
                <div class="intro">
                  <div class="intro-title">Configura tu API Key</div>
                  <div class="intro-text">
                    Para habilitar el chat, introduce una clave de OpenAI. Se guardará de forma
                    segura en el almacenamiento de VS Code.
                  </div>
                </div>
                <div class="buttons">
                  <button type="button" @click=${this.handleSetKey}>Set API Key</button>
                </div>
              `}
        </div>
      </div>
    `;
  }
}
