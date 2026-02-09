import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/view/base.js';

// Import shell logic
export { renderShell } from './shell/index.js';
import { renderShell } from './shell/index.js';

// Import modular parts
import { Tab, MessageType, ViewMode } from '../constants.js';
import type { Tab as TabType, EnrichedModel, CreateActionData, UpdateActionData } from '../types.js';
import { commonStyles } from './common/index.js';
import { hostStyles, renderHost } from './host/index.js';
import { listStyles, renderList } from './list/index.js';
import { newStyles, renderNew } from './new/index.js';
import { editStyles, renderEdit } from './edit/index.js';
import { renderNotFound } from '../../chat/templates/common/index.js';

@customElement('agw-security-view')
export class SecurityView extends AgwViewBase {
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

  @state()
  private environment: 'dev' | 'pro' = 'pro';

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
    console.log('[SecurityView] Received message:', message.type, JSON.stringify(message));
    if (message.type === MessageType.StateUpdate) {
      this.tab = message.tab;
      this.models = message.models;
      this.activeModelId = message.activeModelId;
      this.editingModelId = message.editingModelId;
      this.provider = message.provider;
      this.environment = message.activeEnvironment;
      console.log('[SecurityView] Current tab after update:', this.tab);
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

  private handleEnvironmentChange(env: 'dev' | 'pro') {
    this.environment = env;
    this.postMessage({ type: MessageType.ChangeEnvironment, data: env });
  }

  private handleCreate() {
    const data = {
      name: (this.renderRoot.querySelector('#new-name') as HTMLInputElement).value,
      provider: (this.renderRoot.querySelector('#new-provider') as HTMLSelectElement).value,
      modelId: (this.renderRoot.querySelector('#new-model') as HTMLInputElement).value,
      apiKey: (this.renderRoot.querySelector('#new-key') as HTMLInputElement).value,
      baseUrl: (this.renderRoot.querySelector('#new-endpoint') as HTMLInputElement)?.value,
      environment: this.environment
    };
    this.postMessage({ type: MessageType.CreateModel, data });
  }

  private handleUpdate() {
    const data = {
      name: (this.renderRoot.querySelector('#edit-name') as HTMLInputElement).value,
      provider: (this.renderRoot.querySelector('#edit-provider') as HTMLSelectElement).value,
      modelId: (this.renderRoot.querySelector('#edit-model') as HTMLInputElement).value,
      apiKey: (this.renderRoot.querySelector('#edit-key') as HTMLInputElement).value,
      baseUrl: (this.renderRoot.querySelector('#edit-endpoint') as HTMLInputElement)?.value,
      environment: this.environment
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
    return renderHost(this.tab, () => this.renderActiveTab(), (t) => this.setTab(t), this.environment, (env) => this.handleEnvironmentChange(env));
  }

  private renderActiveTab() {
    if (this.tab === Tab.List) {
      const filteredModels = this.models.filter(m => (m.environment || 'pro') === this.environment);
      return renderList(filteredModels, this.activeModelId, {
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

    return renderNotFound();
  }
}

export default {
  render: renderShell
};
