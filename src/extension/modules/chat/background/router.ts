import { Tab } from '../constants.js';
import type { Tab as TabType, ChatViewState } from '../types.js';

export class ChatRouter {
  private state: ChatViewState = {
    tab: Tab.Main
  };

  public setTab(tab: TabType): void {
    this.state.tab = tab;
  }

  public getState(): ChatViewState {
    return { ...this.state };
  }
}
