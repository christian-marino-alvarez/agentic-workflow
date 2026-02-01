import { LitElement, html, css } from 'https://unpkg.com/lit@3.2.0/index.js?module';
import type { CSSResultGroup } from 'https://unpkg.com/lit@3.2.0/index.js?module';
import { state } from 'https://unpkg.com/lit@3.2.0/decorators.js?module';

export type AgwStatus = 'loading' | 'ready' | 'error';

export abstract class AgwViewBase extends LitElement {
  @state()
  protected status: AgwStatus = 'loading';

  @state()
  protected errorMessage = '';

  protected readonly vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : null;

  private hasRun = false;

  public static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color-scheme: light dark;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
      opacity: 0.7;
    }
    .error {
      color: var(--vscode-errorForeground, #f14c4c);
      font-size: 12px;
    }
  `;

  protected firstUpdated(): void {
    this.run();
  }

  protected run(): void {
    if (this.hasRun) {
      return;
    }
    this.hasRun = true;
    this.listen();
    this.predata();
    void this.loadData()
      .then(() => {
        this.status = 'ready';
        this.log('info', 'status-ready');
        this.requestUpdate();
      })
      .catch((error: unknown) => {
        this.status = 'error';
        this.errorMessage = error instanceof Error ? error.message : 'Unexpected error';
        this.log('error', 'loadData-failed', { message: this.errorMessage });
      });
  }

  protected listen(): void {}

  protected predata(): void {
    this.status = 'loading';
  }

  protected async loadData(): Promise<void> {}

  protected renderLoading() {
    return html`<div class="loading">Loading…</div>`;
  }

  protected renderError() {
    return html`<div class="error">${this.errorMessage}</div>`;
  }

  protected abstract renderView(): unknown;

  protected render(): unknown {
    if (this.status === 'loading') {
      return this.renderLoading();
    }
    if (this.status === 'error') {
      return this.renderError();
    }
    return this.renderView();
  }

  protected postMessage(payload: Record<string, unknown>): void {
    this.vscode?.postMessage(payload);
  }

  protected log(level: string, message: string, payload?: Record<string, unknown>): void {
    this.postMessage({ type: 'log', level, message, payload });
  }
}
