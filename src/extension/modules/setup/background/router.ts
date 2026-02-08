import { Tab, ViewMode } from '../constants.js';
import type { Tab as TabType, SetupViewState, ViewMode as ViewModeType } from '../types.js';

export class SetupRouter {
  private state: SetupViewState = {
    tab: Tab.New,
    selectedProvider: 'openai',
    editSelectedProvider: 'openai'
  };

  public setTab(tab: TabType): void {
    this.state.tab = tab;
    if (tab === Tab.New) {
      this.state.selectedProvider = 'openai';
    }
  }

  public setProvider(provider: string, mode: ViewModeType = ViewMode.New): void {
    if (mode === ViewMode.New) {
      this.state.selectedProvider = provider;
    } else {
      this.state.editSelectedProvider = provider;
    }
  }

  public setEditingModel(id: string, provider: string): void {
    this.state.editingModelId = id;
    this.state.editSelectedProvider = provider;
    this.state.tab = Tab.Edit;
  }

  public getState(): SetupViewState {
    return { ...this.state };
  }
}
