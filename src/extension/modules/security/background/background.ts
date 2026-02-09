import type { ExtensionContext, WebviewView } from 'vscode';
import { commands, Uri } from 'vscode';
import { CONTEXT_HAS_KEY, OPENAI_KEY_SECRET, Tab, ApiKeyStatus, MessageType, ViewMode } from '../constants.js';
import type { EnrichedModel, CreateActionData, UpdateActionData, StateUpdateMessage, ModelConfig, ProviderType, SecurityDomain, SecurityModule } from '../types.js';
import { AgwViewProviderBase } from '../../../core/controller/base.js';
import { onMessage } from '../../../core/decorators/onMessage.js';
import { SettingsStorage } from './settings-storage.js';
import { ApiKeyBroadcaster } from './state/index.js';
import { registerOpenAIKeyCommand } from './commands/index.js';
import { SecurityRouter } from './router.js';
import { SecurityEngine } from '../runtime/index.js';
import template from '../templates/index.js';

export class SecurityController extends AgwViewProviderBase {
  public static readonly viewType = 'keyView';

  private readonly router = new SecurityRouter();
  private readonly engine = new SecurityEngine();

  public constructor(
    context: ExtensionContext,
    private readonly apiKeyBroadcaster: ApiKeyBroadcaster,
    private readonly settingsStorage: SettingsStorage
  ) {
    super(context, SecurityController.viewType);
    void this.syncInitialState();
  }

  protected onResolve(webviewView: WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };
    this.refresh();
  }

  private async refresh(): Promise<void> {
    if (this.webviewView) {
      await this.renderHtml(this.webviewView);
    }
  }

  private async renderHtml(webviewView: WebviewView): Promise<void> {
    const nonce = this.createNonce();
    await this.ensureMigration();

    const scriptUri = webviewView.webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'dist', 'extension', 'modules', 'security', 'web', 'security-view.js')
    );

    this.renderTemplate(webviewView, template.render, {
      nonce,
      scriptUri: scriptUri.toString(),
      cspSource: webviewView.webview.cspSource
    });
  }

  private async syncState(): Promise<void> {
    if (!this.webviewView) {
      console.log('[SecurityController] syncState - No webviewView');
      return;
    }

    const state = this.router.getState();
    const config = this.settingsStorage.getConfig();


    const enrichedModels = await this.getEnrichedModels();
    const activeEnvironment = this.settingsStorage.getEnvironment();

    // El Router determina el nuevo estado, el Controller lo sincroniza con la vista
    const message: StateUpdateMessage = {
      type: MessageType.StateUpdate,
      tab: state.tab,
      models: enrichedModels,
      activeModelId: config.activeModelId,
      activeEnvironment,
      editingModelId: state.editingModelId,
      provider: state.tab === Tab.New ? state.selectedProvider : state.editSelectedProvider
    };

    this.postMessage(message);
  }

  protected override async onReady(): Promise<void> {
    console.log('[SecurityController] onReady - Webview is ready');
    await this.syncInitialState();
    await this.syncState();
  }

  @onMessage(MessageType.SetTab)
  protected async handleSetTab(message: { tab: any }): Promise<void> {
    this.router.setTab(message.tab);
    await this.syncState();
  }

  @onMessage(MessageType.ChangeProvider)
  protected async handleChangeProvider(message: { data: string }): Promise<void> {
    this.router.setProvider(message.data, ViewMode.New);
    await this.syncState();
  }

  @onMessage(MessageType.ChangeEditProvider)
  protected async handleChangeEditProvider(message: { data: string }): Promise<void> {
    this.router.setProvider(message.data, ViewMode.Edit);
    await this.syncState();
  }

  @onMessage(MessageType.EditModel)
  protected async handleEditModel(message: { data: string }): Promise<void> {
    const model = this.settingsStorage.getConfig().models.find((m: ModelConfig) => m.id === message.data);
    if (model) {
      this.router.setEditingModel(message.data, model.provider);
      await this.syncState();
    }
  }

  @onMessage(MessageType.SetActive)
  protected async handleSetActive(message: { data: string }): Promise<void> {
    await this.settingsStorage.setActiveModelId(message.data);
    await this.syncInitialState();
    await this.syncState();
  }

  @onMessage(MessageType.ChangeEnvironment)
  protected async handleChangeEnvironment(message: { data: 'dev' | 'pro' }): Promise<void> {
    await this.settingsStorage.setEnvironment(message.data);
    await this.syncInitialState();
    await this.syncState();
  }

  @onMessage(MessageType.DeleteModel)
  protected async handleDeleteModel(message: { data: string }): Promise<void> {
    const config = this.settingsStorage.getConfig();
    const newModels = config.models.filter((m: ModelConfig) => m.id !== message.data);
    await this.settingsStorage.setModels(newModels);
    this.router.setTab(Tab.List); // Volver a la lista tras borrar
    await this.syncState();
  }

  @onMessage(MessageType.CreateModel)
  protected async handleCreate(message: { data: CreateActionData }): Promise<void> {
    const { data } = message;
    const config = this.settingsStorage.getConfig();
    const newModel = this.engine.createModel(data);

    if (data.apiKey) {
      await this.context.secrets.store(newModel.secretKeyId, data.apiKey);
    }

    await this.settingsStorage.setModels([...config.models, newModel]);
    this.router.setTab(Tab.List);
    await this.syncState();
  }

  @onMessage(MessageType.UpdateModel)
  protected async handleUpdate(message: { data: UpdateActionData }): Promise<void> {
    const { data } = message;
    const config = this.settingsStorage.getConfig();
    const editingModelId = this.router.getState().editingModelId;

    if (!editingModelId) {
      return;
    }

    if (data.apiKey) {
      const model = config.models.find(m => m.id === editingModelId);
      if (model) {
        await this.context.secrets.store(model.secretKeyId, data.apiKey);
      }
    }

    const updatedModels = this.engine.updateModelInList(config.models, editingModelId, {
      name: data.name,
      provider: data.provider,
      modelId: data.modelId,
      baseUrl: data.baseUrl,
      environment: data.environment
    });

    await this.settingsStorage.setModels(updatedModels);
    this.router.setTab(Tab.List);
    await this.syncState();
  }

  private async getEnrichedModels(): Promise<EnrichedModel[]> {
    const config = this.settingsStorage.getConfig();
    const keys: Record<string, boolean> = {};

    await Promise.all(config.models.map(async (m) => {
      const key = await this.context.secrets.get(m.secretKeyId);
      keys[m.secretKeyId] = Boolean(key);
    }));

    return this.engine.enrichModels(config.models, keys);
  }

  private async ensureMigration(): Promise<void> {
    const config = this.settingsStorage.getConfig();
    if (config.models.length === 0) {
      const openaiKey = await this.context.secrets.get(OPENAI_KEY_SECRET);
      if (openaiKey) {
        const defaultModel: ModelConfig = {
          id: 'default-openai',
          name: 'OpenAI (Migrado)',
          provider: 'openai',
          modelId: 'gpt-4o',
          secretKeyId: OPENAI_KEY_SECRET,
          parameters: { temperature: 0.7, maxTokens: 2048 },
          environment: 'pro'
        };
        await this.settingsStorage.setModels([defaultModel]);
        await this.settingsStorage.setActiveModelId(defaultModel.id);
      }
    }
  }

  private async syncInitialState(): Promise<void> {
    const config = this.settingsStorage.getConfig();
    this.router.setEnvironment(config.environment || 'pro');
    const activeModel = config.models.find((m: ModelConfig) => m.id === config.activeModelId);
    const hasKey = activeModel ? Boolean(await this.context.secrets.get(activeModel.secretKeyId)) : false;

    void commands.executeCommand('setContext', CONTEXT_HAS_KEY, hasKey);
    this.apiKeyBroadcaster.notify(hasKey ? ApiKeyStatus.Present : ApiKeyStatus.Missing);

    if (config.models.length === 0) {
      this.router.setTab(Tab.New);
    } else if (this.router.getState().tab === Tab.New && !this.router.getState().editingModelId) {
      // If we have models and are on the default tab (New) without editing, show the list
      this.router.setTab(Tab.List);
    }
  }

  @onMessage(MessageType.GoChat)
  protected async handleGoChat(): Promise<void> {
    void commands.executeCommand('workbench.view.extension.main');
    void commands.executeCommand('chatView.focus');
  }
}

import { randomBytes } from 'crypto';
import { SecretHelper } from './secret-helper.js';
import { BridgeServer } from './bridge-server.js';

/**
 * Creates and registers the security domain.
 */
export async function createSecurityDomain(context: ExtensionContext): Promise<SecurityDomain> {
  const apiKeyBroadcaster = new ApiKeyBroadcaster();
  const settingsStorage = new SettingsStorage(context.globalState);
  const secretHelper = new SecretHelper(context);
  const view = new SecurityController(context, apiKeyBroadcaster, settingsStorage);

  // Generar claves de sesión únicas para esta instancia
  const sessionKey = randomBytes(32).toString('hex');
  const bridgeToken = randomBytes(16).toString('hex');

  // Arrancar el Servidor Puente
  const bridgeServer = new BridgeServer(secretHelper, sessionKey, bridgeToken);
  const bridgePort = await bridgeServer.start();

  // Register commands
  const commandDisposable = registerOpenAIKeyCommand(context, apiKeyBroadcaster);
  context.subscriptions.push(apiKeyBroadcaster, commandDisposable);
  context.subscriptions.push({ dispose: () => bridgeServer.stop() });

  return {
    view,
    apiKeyBroadcaster,
    settingsStorage,
    bridge: {
      sessionKey,
      bridgeToken,
      port: bridgePort
    }
  };
}

export const Security: SecurityModule = {
  register: createSecurityDomain
};
