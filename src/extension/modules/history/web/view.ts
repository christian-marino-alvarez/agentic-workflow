import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/web/index.js';

@customElement('agw-history-view')
export class View extends AgwViewBase {
  public static styles = [
    AgwViewBase.styles,
    css`
      .container {
        padding: 16px;
        text-align: center;
      }
      .title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 6px;
      }
      .subtitle {
        font-size: 12px;
        opacity: 0.8;
      }
    `
  ];

  protected async loadData(): Promise<void> {
    this.log('info', 'init', { human: 'Inicializando vista de historial' });
    this.postMessage({ type: 'webview-ready', view: 'historyView' });
  }

  protected renderView() {
    return html`
      <div class="container">
        <div class="title">Historial</div>
        <div class="subtitle">Proximamente.</div>
      </div>
    `;
  }
}
