import fs from 'node:fs/promises';
import path from 'node:path';
import OpenAI from 'openai';
import {
  ChatKitThreadStore,
  extractText,
  getUserMessageInput,
  page,
  type ChatKitRequest,
  type ThreadEvent
} from './protocol.js';

// Inter-module communication (JIT secrets)
import { eventBus, SECURITY_EVENTS } from '../../../../../backend/shared/event-bus.js';
import { randomUUID } from 'node:crypto';

const OPENAI_KEY_SECRET = 'openai-api-key';

async function getSecretJit(secretKeyId: string, environment: 'dev' | 'pro'): Promise<string> {
  const requestId = randomUUID();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      eventBus.removeAllListeners(SECURITY_EVENTS.SECRET_RESPONSE(requestId));
      reject(new Error(`Timeout waiting for secret ${secretKeyId} env=${environment}`));
    }, 5000);

    eventBus.once(SECURITY_EVENTS.SECRET_RESPONSE(requestId), (payload: { secret?: string; error?: string }) => {
      clearTimeout(timeout);
      if (payload.error) {
        reject(new Error(payload.error));
      } else if (payload.secret) {
        resolve(payload.secret);
      } else {
        reject(new Error('Unknown error retrieving secret'));
      }
    });

    eventBus.emit(SECURITY_EVENTS.SECRET_REQUEST, { secretKeyId, requestId, environment });
  });
}

const threadStore = new ChatKitThreadStore();
let cachedSystemPrompt: string | undefined;

async function getSystemPrompt(): Promise<string> {
  if (cachedSystemPrompt) {
    return cachedSystemPrompt;
  }

  const workspaceRoot = process.cwd();
  // Assume SIDEBAR runs in a way that process.cwd() is project root
  const rolePath = path.join(workspaceRoot, '.agent', 'rules', 'roles', 'neo.md');
  const constitutionDir = path.join(workspaceRoot, '.agent', 'rules', 'constitution');

  try {
    const roleText = await fs.readFile(rolePath, 'utf8');
    const constFiles = await fs.readdir(constitutionDir);
    const constitutionTexts = await Promise.all(
      constFiles
        .filter(f => f.endsWith('.md'))
        .map(f => fs.readFile(path.join(constitutionDir, f), 'utf8'))
    );

    cachedSystemPrompt = [
      'You are Neo, the first agent.',
      '\n[Neo Role]\n',
      roleText.trim(),
      '\n[Constitutions]\n',
      constitutionTexts.map(t => t.trim()).join('\n\n')
    ].filter(Boolean).join('\n');

    return cachedSystemPrompt;
  } catch (err) {
    console.error('[ChatKit-Backend] Failed to load system prompt:', err);
    return 'You are Neo, the first agent.';
  }
}

export const registerChatKitRoutes = (fastify: any) => {
  fastify.post('/chatkit', async (request: any, reply: any) => {
    const payload = request.body as ChatKitRequest;
    if (!payload?.type) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    // JIT OpenAI API Key
    let apiKey: string;
    const secretKeyId = (payload.params as any)?.secret_key_id ?? OPENAI_KEY_SECRET;
    const environment = (payload.params as any)?.environment ?? 'pro';
    try {
      apiKey = await getSecretJit(secretKeyId, environment);
    } catch (err) {
      console.error('[ChatKit-Backend] Secret retrieval failed:', err);
      return reply.status(401).send({ error: 'OpenAI API key not configured or bridge timeout.' });
    }

    switch (payload.type) {
      case 'threads_create':
        return await handleStreamThreadCreate(reply, apiKey, payload);
      case 'threads_add_user_message':
        return await handleStreamThreadAddMessage(reply, apiKey, payload);
      case 'threads_list':
        return reply.send(page(threadStore.listThreads()));
      case 'threads_get_by_id': {
        const tid = payload.params?.thread_id as string;
        const thread = threadStore.getThread(tid);
        return thread ? reply.send(thread) : reply.status(404).send({ error: 'Not found' });
      }
      case 'items_list': {
        const tid = payload.params?.thread_id as string;
        const items = threadStore.listItems(tid);
        return items ? reply.send(items) : reply.status(404).send({ error: 'Not found' });
      }
      case 'threads_update': {
        const tid = payload.params?.thread_id as string;
        const title = payload.params?.title as string;
        const updated = threadStore.updateThreadTitle(tid, title);
        return updated ? reply.send(updated) : reply.status(404).send({ error: 'Not found' });
      }
      case 'threads_delete': {
        const tid = payload.params?.thread_id as string;
        threadStore.deleteThread(tid);
        return reply.send({});
      }
      case 'items_feedback':
        return reply.send({});
      default:
        return reply.status(400).send({ error: `Unsupported request type: ${payload.type}` });
    }
  });
};

async function handleStreamThreadCreate(reply: any, apiKey: string, payload: ChatKitRequest) {
  const input = getUserMessageInput(payload);
  if (!input) {
    return reply.status(400).send({ error: 'Invalid user input.' });
  }

  const thread = threadStore.createThread();
  const userItem = threadStore.addUserItem(thread.id, input);

  setupSSE(reply);
  writeSSE(reply, { type: 'thread.created', thread: threadStore.getThread(thread.id) ?? thread });

  if (userItem) {
    writeSSE(reply, { type: 'thread.item.added', item: userItem });
  }

  const assistantItem = await createAssistantItem(apiKey, input, thread.id);
  if (assistantItem) {
    threadStore.addAssistantItem(thread.id, assistantItem.content[0]?.text ?? '');
    writeSSE(reply, { type: 'thread.item.added', item: assistantItem });
    writeSSE(reply, { type: 'thread.item.done', item: assistantItem });
  }

  reply.raw.end();
}

async function handleStreamThreadAddMessage(reply: any, apiKey: string, payload: ChatKitRequest) {
  const input = getUserMessageInput(payload);
  const threadId = payload.params?.thread_id as string;

  if (!input || !threadId || !threadStore.hasThread(threadId)) {
    return reply.status(400).send({ error: 'Invalid thread or input.' });
  }

  const userItem = threadStore.addUserItem(threadId, input);

  setupSSE(reply);
  if (userItem) {
    writeSSE(reply, { type: 'thread.item.added', item: userItem });
  }

  const assistantItem = await createAssistantItem(apiKey, input, threadId);
  if (assistantItem) {
    threadStore.addAssistantItem(threadId, assistantItem.content[0]?.text ?? '');
    writeSSE(reply, { type: 'thread.item.added', item: assistantItem });
    writeSSE(reply, { type: 'thread.item.done', item: assistantItem });
  }

  reply.raw.end();
}

async function createAssistantItem(apiKey: string, input: any, threadId: string) {
  const systemPrompt = await getSystemPrompt();
  const userText = extractText({ ...input, attachments: [], quoted_text: null });

  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: false });
  const model = input.inference_options.model ?? 'gpt-4o'; // Default sensible model

  try {
    // Stick to original project's usage of OpenAI if it's non-standard
    // But since I don't know if 'responses.create' is a custom thing or Orbit,
    // I'll assume standard chat completions for robustness in this sidecar.
    // However, the original code used 'responses.create'. Let's try to match.
    const response = await (client as any).responses.create({
      model,
      instructions: systemPrompt,
      input: userText
    });

    const text = response.output_text ?? 'No response.';
    return threadStore.addAssistantItem(threadId, text);
  } catch (err) {
    console.error('[ChatKit-Backend] OpenAI call failed:', err);
    return threadStore.addAssistantItem(threadId, `Error in inference: ${(err as Error).message}`);
  }
}

function setupSSE(reply: any) {
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
}

function writeSSE(reply: any, event: ThreadEvent) {
  reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
}
