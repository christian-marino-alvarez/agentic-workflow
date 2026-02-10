import { ExtensionContext, Disposable } from 'vscode';
import { AgwBackendClient, BackendClientConfig } from '../../../core/background/index.js';

export interface ChatClientConfig extends BackendClientConfig {
  // Add specific chat client configuration here if needed
}

export class ChatBackendClient extends AgwBackendClient {
  constructor(config: ChatClientConfig) {
    super(config);
  }

  /**
   * Envía un mensaje de usuario al backend de ChatKit y recibe updates SSE.
   * 
   * @param params 
   * @param onUpdate Callback para cada evento del thread (message added, done, etc)
   * @param onError Callback de error
   */
  public async sendMessageStream(
    threadId: string,
    content: any,
    onUpdate: (event: any) => void,
    onError: (err: any) => void
  ): Promise<void> {

    const payload = {
      type: 'threads_add_user_message',
      params: { thread_id: threadId },
      input: {
        raw: content, // Ajustar según estructura real de ChatKitRequest
        content: [{ type: 'text', text: content }], // Ajuste temporal
        inference_options: { model: 'gpt-4o' } // Default model, should come from args
      }
    };

    // Usamos el método stream heredado
    await this.stream(
      '/chatkit',
      payload,
      (data) => {
        // Aquí podríamos transformar eventos crudos del backend a eventos de dominio Chat
        onUpdate(data);
      },
      onError
    );
  }

  /**
   * Crea un nuevo thread
   */
  public async createThread(initialMessage: string): Promise<any> {
    // Implementación futura usando this.post() o this.stream() si create devuelve stream
    return { id: 'todo-impl' };
  }
}
