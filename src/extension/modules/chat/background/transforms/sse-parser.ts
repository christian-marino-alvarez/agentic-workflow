/**
 * SSE Parser Transform — converts raw text chunks into typed SSE events.
 * Handles partial line buffering across chunk boundaries.
 *
 * Pipeline: response.body → TextDecoderStream → SSEParserTransform → consumer
 */

/** Typed SSE event emitted by the sidecar stream. */
export interface SSEEvent {
  type: string;
  content?: string;
  error?: string;
  // Tool events
  name?: string;
  arguments?: any;
  output?: any;
  // Usage
  model?: string;
  provider?: string;
  role?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

/**
 * TransformStream that parses SSE `data:` lines into typed objects.
 * Buffers partial lines across chunk boundaries.
 *
 * Input: string (text chunks from TextDecoderStream)
 * Output: SSEEvent (parsed JSON objects)
 */
export class SSEParserTransform extends TransformStream<string, SSEEvent> {
  constructor() {
    let buffer = '';

    super({
      transform(chunk, controller) {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // last element may be incomplete

        for (const line of lines) {
          if (!line.startsWith('data: ')) { continue; }
          const dataStr = line.slice(6);
          if (dataStr.trim() === '[DONE]') { continue; }

          try {
            controller.enqueue(JSON.parse(dataStr));
          } catch {
            // Partial JSON — ignore until complete
          }
        }
      },

      flush(controller) {
        if (buffer.startsWith('data: ')) {
          const dataStr = buffer.slice(6);
          if (dataStr.trim() !== '[DONE]') {
            try {
              controller.enqueue(JSON.parse(dataStr));
            } catch { /* incomplete final chunk */ }
          }
        }
      },
    });
  }
}
