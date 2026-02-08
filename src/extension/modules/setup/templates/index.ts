import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/view/base.js';

// Import shell logic
export { renderShell } from './shell/html/index.js';
import { renderShell } from './shell/html/index.js';

// Import modular parts
import { Tab, MessageType, ViewMode } from '../constants.js';
import type { Tab as TabType, EnrichedModel, CreateActionData, UpdateActionData } from '../types.js';
import { commonStyles } from './common/css/index.js';
import { hostStyles } from './host/css/index.js';
import { renderHost } from './host/html/index.js';
import { listStyles } from './list/css/index.js';
import { renderList } from './list/html/index.js';
import { newStyles } from './new/css/index.js';
import { renderNew } from './new/html/index.js';
import { editStyles } from './edit/css/index.js';
import { renderEdit } from './edit/html/index.js';

@customElement('agw-setup-view')
export class View extends AgwViewBase {
  @state()
  private tab: TabType = Tab.New;

  @state()
  private models: EnrichedModel[] = [];

  @state()
  private activeModelId: string = '';

  @state()
  private editingModelId: string = '';

  @state()
  private provider: string = 'openai';

  public static styles = [
    AgwViewBase.styles,
    commonStyles,
    hostStyles,
    listStyles,
    newStyles,
    editStyles
  ];

  protected listen(): void {
    window.addEventListener('message', (event) => this.handleMessage(event));
    this.postMessage({ type: MessageType.WebviewReady });
  }

  private handleMessage(event: MessageEvent): void {
    const message = event.data;
    console.log('[SetupView] Received message:', message.type, JSON.stringify(message));
    if (message.type === MessageType.StateUpdate) {
      this.tab = message.tab;
      this.models = message.models;
      this.activeModelId = message.activeModelId;
      this.editingModelId = message.editingModelId;
      this.provider = message.provider;
      console.log('[SetupView] Current tab after update:', this.tab);
      this.requestUpdate();
    }
  }

  // --- ACTIONS DELEGATION ---

  private setTab(tab: TabType) {
    this.postMessage({ type: MessageType.SetTab, tab });
  }

  private handleAction(type: string, data?: any) {
    this.postMessage({ type, data });
  }

  private handleCreate() {
    const data = {
      name: (this.renderRoot.querySelector('#new-name') as HTMLInputElement).value,
      provider: (this.renderRoot.querySelector('#new-provider') as HTMLSelectElement).value,
      modelId: (this.renderRoot.querySelector('#new-model') as HTMLInputElement).value,
      apiKey: (this.renderRoot.querySelector('#new-key') as HTMLInputElement).value,
      baseUrl: (this.renderRoot.querySelector('#new-endpoint') as HTMLInputElement)?.value
    };
    this.postMessage({ type: MessageType.CreateModel, data });
  }

  private handleUpdate() {
    const data = {
      name: (this.renderRoot.querySelector('#edit-name') as HTMLInputElement).value,
      provider: (this.renderRoot.querySelector('#edit-provider') as HTMLSelectElement).value,
      modelId: (this.renderRoot.querySelector('#edit-model') as HTMLInputElement).value,
      apiKey: (this.renderRoot.querySelector('#edit-key') as HTMLInputElement).value,
      baseUrl: (this.renderRoot.querySelector('#edit-endpoint') as HTMLInputElement)?.value
    };
    this.postMessage({ type: MessageType.UpdateModel, data });
  }

  private handleProviderChange(e: Event, mode: typeof ViewMode[keyof typeof ViewMode]) {
    const val = (e.target as HTMLSelectElement).value;
    this.postMessage({
      type: mode === ViewMode.New ? MessageType.ChangeProvider : MessageType.ChangeEditProvider,
      data: val
    });
  }

  // --- RENDER ---

  protected renderView() {
    return renderHost(this.tab, () => this.renderActiveTab(), (t) => this.setTab(t));
  }

  private renderActiveTab() {
    if (this.tab === Tab.List) {
      return renderList(this.models, this.activeModelId, {
        setActive: (id) => this.handleAction(MessageType.SetActive, id),
        editModel: (id) => this.handleAction(MessageType.EditModel, id),
        deleteModel: (id) => this.handleAction(MessageType.DeleteModel, id)
      });
    }

    if (this.tab === Tab.New) {
      return renderNew(this.provider, {
        create: () => this.handleCreate(),
        changeProvider: (e) => this.handleProviderChange(e, ViewMode.New)
      });
    }

    if (this.tab === Tab.Edit) {
      const model = this.models.find(m => m.id === this.editingModelId);
      return renderEdit(model, this.provider, {
        update: () => this.handleUpdate(),
        cancel: () => this.setTab(Tab.List),
        changeProvider: (e) => this.handleProviderChange(e, ViewMode.Edit)
      });
    }

    return html`<div>Vista no encontrada</div>`;
  }
}

export default {
  render: renderShell
};
