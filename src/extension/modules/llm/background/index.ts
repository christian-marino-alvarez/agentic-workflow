import * as vscode from 'vscode';
import { Background, ViewHtml, Message } from '../../core/index.js';
import { MESSAGES, API_ENDPOINTS, NAME, SIDECAR_BASE_URL } from '../constants.js';
import { AgentRequest, AgentResponse } from '../backend/types.js';

export class LLMBackground extends Background {

  constructor(context: vscode.ExtensionContext) {
    super(NAME, context.extensionUri, 'llm-view');
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    // LLM module might not have a dedicated view yet, or shares one.
    // For now, return empty or standard template.
    // If it uses Settings view for config, maybe this background doesn't need a view provider?
    // But architecture requires it.
    return '';
  }

  /**
   * Handle incoming messages via the parent Background listener.
   */
  public override async listen(message: Message): Promise<any> {
    if (message.payload.command === MESSAGES.LLM_REQUEST) {
      // Delegate to internal method
      return this.handleLLMRequest(message);
    }
  }

  private async handleLLMRequest(message: Message): Promise<any> {
    try {
      const response = await this.sendRequestToSidecar(message.payload.data);
      return response;
    } catch (error: any) {
      this.log('Failed to process LLM request', error);
      return { error: error.message };
    }
  }

  private async sendRequestToSidecar(payload: AgentRequest): Promise<AgentResponse> {
    // Assume sidecar is running on localhost:3000 (standard port per core)
    const url = `${SIDECAR_BASE_URL}${API_ENDPOINTS.RUN}`;

    // Use fetch or axios. Assuming fetch is available in Node 18+ context of Extension Host
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Sidecar error: ${response.statusText}`);
    }

    return await response.json() as AgentResponse;
  }
}
