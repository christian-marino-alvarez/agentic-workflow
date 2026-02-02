import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { ExtensionContext, Webview } from 'vscode';
import { env, Uri, workspace } from 'vscode';
import OpenAI from 'openai';
import {
  ChatKitThreadStore,
  type ChatKitRequest,
  type ThreadEvent,
  extractText,
  getUserMessageInput,
  page
} from './protocol.js';

import { OPENAI_KEY_SECRET } from '../setup/constants.js';

export class ChatKitLocalServer {
  private server?: ReturnType<typeof createServer>;
  private port?: number;
  private threadStore = new ChatKitThreadStore();
  private cachedSystemPrompt?: string;

  public constructor(private readonly context: ExtensionContext) {}

  public async start(): Promise<void> {
    if (this.server) {
      return;
    }

    this.server = createServer((req, res) => {
      void this.handleRequest(req, res);
    });

    await new Promise<void>((resolve) => {
      this.server?.listen(0, '127.0.0.1', () => {
        const address = this.server?.address() as AddressInfo | null;
        this.port = address?.port;
        resolve();
      });
    });
  }

  public async getExternalBaseUri(_webview: Webview): Promise<Uri> {
    await this.start();
    if (!this.port) {
      throw new Error('ChatKit server port unavailable.');
    }
    const localUri = Uri.parse(`http://127.0.0.1:${this.port}`);
    return env.asExternalUri(localUri);
  }

  public dispose(): void {
    this.server?.close();
    this.server = undefined;
    this.port = undefined;
    this.threadStore = new ChatKitThreadStore();
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    this.writeCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    if (url.pathname !== '/chatkit') {
      this.writeJson(res, 404, { error: 'Not found.' });
      return;
    }

    if (req.method !== 'POST') {
      this.writeJson(res, 405, { error: 'Method not allowed.' });
      return;
    }

    const payload = await this.readJson<ChatKitRequest>(req);
    if (!payload?.type) {
      this.writeJson(res, 400, { error: 'Invalid request.' });
      return;
    }

    const apiKey = await this.context.secrets.get(OPENAI_KEY_SECRET);
    if (!apiKey) {
      this.writeJson(res, 401, { error: 'OpenAI API key not configured.' });
      return;
    }

    switch (payload.type) {
      case 'threads.create':
        await this.streamThreadCreate(res, apiKey, payload);
        return;
      case 'threads.add_user_message':
        await this.streamThreadAddMessage(res, apiKey, payload);
        return;
      case 'threads.list':
        this.handleThreadsList(res);
        return;
      case 'threads.get_by_id':
        this.handleThreadGetById(res, payload);
        return;
      case 'items.list':
        this.handleItemsList(res, payload);
        return;
      case 'threads.update':
        this.handleThreadUpdate(res, payload);
        return;
      case 'threads.delete':
        this.handleThreadDelete(res, payload);
        return;
      case 'items.feedback':
        this.writeJson(res, 200, {});
        return;
      default:
        this.writeJson(res, 400, { error: `Unsupported request type: ${payload.type}` });
    }
  }

  private async streamThreadCreate(
    res: ServerResponse,
    apiKey: string,
    payload: ChatKitRequest
  ): Promise<void> {
    const input = getUserMessageInput(payload);
    if (!input) {
      this.writeJson(res, 400, { error: 'Invalid user input.' });
      return;
    }

    const thread = this.threadStore.createThread();
    const userItem = this.threadStore.addUserItem(thread.id, input);

    this.startStream(res);
    this.writeEvent(res, { type: 'thread.created', thread: this.threadStore.getThread(thread.id) ?? thread });

    if (userItem) {
      this.writeEvent(res, { type: 'thread.item.added', item: userItem });
    }

    const assistantItem = await this.createAssistantItem(apiKey, input, thread.id);
    if (assistantItem) {
      this.threadStore.addAssistantItem(thread.id, assistantItem.content[0]?.text ?? '');
      this.writeEvent(res, { type: 'thread.item.added', item: assistantItem });
      this.writeEvent(res, { type: 'thread.item.done', item: assistantItem });
    }

    this.endStream(res);
  }

  private async streamThreadAddMessage(
    res: ServerResponse,
    apiKey: string,
    payload: ChatKitRequest
  ): Promise<void> {
    const input = getUserMessageInput(payload);
    const threadId = typeof payload.params?.thread_id === 'string' ? payload.params.thread_id : null;

    if (!input || !threadId || !this.threadStore.hasThread(threadId)) {
      this.writeJson(res, 400, { error: 'Invalid thread or input.' });
      return;
    }

    const userItem = this.threadStore.addUserItem(threadId, input);

    this.startStream(res);
    if (userItem) {
      this.writeEvent(res, { type: 'thread.item.added', item: userItem });
    }

    const assistantItem = await this.createAssistantItem(apiKey, input, threadId);
    if (assistantItem) {
      this.threadStore.addAssistantItem(threadId, assistantItem.content[0]?.text ?? '');
      this.writeEvent(res, { type: 'thread.item.added', item: assistantItem });
      this.writeEvent(res, { type: 'thread.item.done', item: assistantItem });
    }

    this.endStream(res);
  }

  private handleThreadsList(res: ServerResponse): void {
    const data = this.threadStore.listThreads();
    this.writeJson(res, 200, page(data));
  }

  private handleThreadGetById(res: ServerResponse, payload: ChatKitRequest): void {
    const threadId = typeof payload.params?.thread_id === 'string' ? payload.params.thread_id : null;
    if (!threadId) {
      this.writeJson(res, 404, { error: 'Thread not found.' });
      return;
    }

    const thread = this.threadStore.getThread(threadId);
    if (!thread) {
      this.writeJson(res, 404, { error: 'Thread not found.' });
      return;
    }

    this.writeJson(res, 200, thread);
  }

  private handleItemsList(res: ServerResponse, payload: ChatKitRequest): void {
    const threadId = typeof payload.params?.thread_id === 'string' ? payload.params.thread_id : null;
    if (!threadId) {
      this.writeJson(res, 404, { error: 'Thread not found.' });
      return;
    }

    const items = this.threadStore.listItems(threadId);
    if (!items) {
      this.writeJson(res, 404, { error: 'Thread not found.' });
      return;
    }

    this.writeJson(res, 200, items);
  }

  private handleThreadUpdate(res: ServerResponse, payload: ChatKitRequest): void {
    const threadId = typeof payload.params?.thread_id === 'string' ? payload.params.thread_id : null;
    const title = typeof payload.params?.title === 'string' ? payload.params.title : null;

    if (!threadId || !title) {
      this.writeJson(res, 400, { error: 'Invalid thread update.' });
      return;
    }

    const updated = this.threadStore.updateThreadTitle(threadId, title);
    if (!updated) {
      this.writeJson(res, 404, { error: 'Thread not found.' });
      return;
    }

    this.writeJson(res, 200, updated);
  }

  private handleThreadDelete(res: ServerResponse, payload: ChatKitRequest): void {
    const threadId = typeof payload.params?.thread_id === 'string' ? payload.params.thread_id : null;
    if (!threadId) {
      this.writeJson(res, 400, { error: 'Invalid thread delete.' });
      return;
    }

    this.threadStore.deleteThread(threadId);
    this.writeJson(res, 200, {});
  }

  private async createAssistantItem(
    apiKey: string,
    input: { content: { type: 'input_text' | 'input_tag'; text?: string }[]; inference_options: { model?: string | null } },
    threadId: string
  ) {
    const systemPrompt = await this.getSystemPrompt();
    const userText = extractText({
      ...input,
      attachments: [],
      quoted_text: null
    });

    const client = new OpenAI({ apiKey });
    const model = input.inference_options.model ?? 'gpt-5';
    const response = await client.responses.create({
      model,
      instructions: systemPrompt,
      input: userText
    });

    const text = response.output_text ?? 'No response.';

    return this.threadStore.addAssistantItem(threadId, text);
  }

  private async getSystemPrompt(): Promise<string> {
    if (this.cachedSystemPrompt) {
      return this.cachedSystemPrompt;
    }

    const workspaceRoot = workspace.workspaceFolders?.[0]?.uri;
    if (!workspaceRoot) {
      this.cachedSystemPrompt = 'You are Neo, the first agent.';
      return this.cachedSystemPrompt;
    }

    const rolePath = Uri.joinPath(workspaceRoot, '.agent', 'rules', 'roles', 'neo.md');
    const constitutionDir = Uri.joinPath(workspaceRoot, '.agent', 'rules', 'constitution');

    const roleText = await this.readFileText(rolePath);
    const constitutionFiles = await this.readDirectoryFiles(constitutionDir);
    const constitutionTexts = await Promise.all(
      constitutionFiles.map((file) => this.readFileText(Uri.joinPath(constitutionDir, file)))
    );

    this.cachedSystemPrompt = [
      'You are Neo, the first agent.',
      '\n[Neo Role]\n',
      roleText.trim(),
      '\n[Constitutions]\n',
      constitutionTexts.map((text) => text.trim()).join('\n\n')
    ]
      .filter(Boolean)
      .join('\n');

    return this.cachedSystemPrompt;
  }

  private async readFileText(uri: Uri): Promise<string> {
    try {
      const data = await workspace.fs.readFile(uri);
      return Buffer.from(data).toString('utf8');
    } catch {
      return '';
    }
  }

  private async readDirectoryFiles(uri: Uri): Promise<string[]> {
    try {
      const entries = await workspace.fs.readDirectory(uri);
      return entries
        .filter(([name, type]) => type === 1 && name.endsWith('.md'))
        .map(([name]) => name)
        .sort();
    } catch {
      return [];
    }
  }

  private startStream(res: ServerResponse): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
  }

  private writeEvent(res: ServerResponse, event: ThreadEvent): void {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  private endStream(res: ServerResponse): void {
    res.end();
  }

  private async readJson<T>(req: IncomingMessage): Promise<T | null> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    if (chunks.length === 0) {
      return null;
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
    } catch {
      return null;
    }
  }

  private writeCorsHeaders(res: ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  private writeJson(res: ServerResponse, status: number, payload: unknown): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  }
}
