import { EncryptionHelper } from '../../../shared/security/encryption.js';

export interface BackendClientConfig {
  baseUrl: string;
  bridgePort: number;
  bridgeToken: string;
  sessionKey: string;
}

export abstract class AgwBackendClient {
  constructor(protected readonly config: BackendClientConfig) { }

  /**
   * Obtiene un secreto seguro del Bridge local.
   * @param secretKeyId ID del secreto a recuperar (ej: "openai_api_key")
   */
  protected async getSecret(secretKeyId: string): Promise<string> {
    const { bridgePort, bridgeToken, sessionKey } = this.config;
    const url = `http://127.0.0.1:${bridgePort}/secrets/query`;

    // 1. Cifrar la petición (el ID del secreto)
    const encryptedRequest = EncryptionHelper.encrypt(secretKeyId, sessionKey);

    try {
      // 2. Llamada al Bridge
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bridgeToken}`
        },
        body: JSON.stringify(encryptedRequest)
      });

      if (!response.ok) {
        throw new Error(`Bridge returned ${response.status}: ${await response.text()}`);
      }

      // 3. Descifrar la respuesta
      const encryptedResponse = await response.json();
      const secret = EncryptionHelper.decrypt(encryptedResponse, sessionKey);

      return secret;
    } catch (error) {
      console.error(`[AgwBackendClient] Error getting secret '${secretKeyId}':`, error);
      throw error;
    }
  }

  /**
   * Realiza una petición POST estándar al backend.
   */
  protected async post<T>(path: string, body: any, headers: Record<string, string> = {}): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend POST ${path} failed (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Inicia un stream SSE (Server-Sent Events) hacia el backend.
   * Utiliza TransformStream para procesar líneas y eventos.
   */
  protected async stream(
    path: string,
    body: any,
    onData: (data: any) => void,
    onError: (err: any) => void,
    headers: Record<string, string> = {}
  ): Promise<void> {
    const url = `${this.config.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...headers
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Backend Stream ${path} failed (${response.status}): ${await response.text()}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Procesamiento del stream usando Web Streams API
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(this.createSSEParser())
        .getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        if (value) {
          try {
            // value es un objeto JSON parseado del evento 'data'
            onData(value);
          } catch (e) {
            console.warn('[AgwBackendClient] Error handling stream chunk:', e);
          }
        }
      }

    } catch (error) {
      console.error(`[AgwBackendClient] Stream error on ${path}:`, error);
      onError(error);
    }
  }

  /**
   * Crea un TransformStream que parsea el formato SSE:
   * data: {...}\n\n
   */
  private createSSEParser(): TransformStream<string, any> {
    let buffer = '';

    return new TransformStream({
      transform(chunk, controller) {
        buffer += chunk;
        const lines = buffer.split('\n\n');

        // El último elemento es el resto del buffer (incompleto) o vacío
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }

          // Formato esperado: "data: {...}"
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              // Señal de fin de stream opcional
              continue;
            }
            try {
              const data = JSON.parse(dataStr);
              controller.enqueue(data);
            } catch (err) {
              console.warn('[AgwBackendClient] Failed to parse SSE JSON:', dataStr);
            }
          }
        }
      },
      flush(controller) {
        // Procesar lo que quede en el buffer si es válido (raro en SSE bien formado)
        if (buffer.trim().startsWith('data: ')) {
          try {
            const data = JSON.parse(buffer.trim().slice(6));
            controller.enqueue(data);
          } catch (err) { /* ignore */ }
        }
      }
    });
  }
}
