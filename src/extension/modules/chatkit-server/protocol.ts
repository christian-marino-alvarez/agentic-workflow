import { randomUUID } from 'node:crypto';

export type ChatKitRequestType =
  | 'threads.create'
  | 'threads.add_user_message'
  | 'threads.list'
  | 'threads.get_by_id'
  | 'items.list'
  | 'threads.update'
  | 'threads.delete'
  | 'items.feedback';

export interface ChatKitRequest {
  type: ChatKitRequestType;
  params?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface Page<T> {
  data: T[];
  has_more: boolean;
  after: string | null;
}

export interface ThreadMetadata {
  id: string;
  title: string | null;
  created_at: string;
  status: { type: 'active' | 'locked' | 'closed'; reason?: string | null };
  metadata: Record<string, unknown>;
}

export interface Thread extends ThreadMetadata {
  items: Page<ThreadItem>;
}

export interface ThreadItemBase {
  id: string;
  thread_id: string;
  created_at: string;
}

export interface UserMessageContent {
  type: 'input_text' | 'input_tag';
  text?: string;
  id?: string;
  data?: Record<string, unknown>;
  group?: string | null;
  interactive?: boolean;
}

export interface InferenceOptions {
  model?: string | null;
  tool_choice?: { id: string } | null;
}

export interface UserMessageInput {
  content: UserMessageContent[];
  attachments: string[];
  quoted_text?: string | null;
  inference_options: InferenceOptions;
}

export interface UserMessageItem extends ThreadItemBase {
  type: 'user_message';
  content: UserMessageContent[];
  attachments: unknown[];
  quoted_text?: string | null;
  inference_options: InferenceOptions;
}

export interface AssistantMessageContent {
  type: 'output_text';
  text: string;
  annotations: unknown[];
}

export interface AssistantMessageItem extends ThreadItemBase {
  type: 'assistant_message';
  content: AssistantMessageContent[];
}

export type ThreadItem = UserMessageItem | AssistantMessageItem;

export type ThreadEvent =
  | { type: 'thread.created'; thread: Thread }
  | { type: 'thread.updated'; thread: Thread }
  | { type: 'thread.item.added'; item: ThreadItem }
  | { type: 'thread.item.done'; item: ThreadItem }
  | { type: 'error'; code?: string; message?: string; allow_retry?: boolean };

interface ThreadStoreEntry {
  thread: Thread;
  items: ThreadItem[];
}

export class ChatKitThreadStore {
  private threads = new Map<string, ThreadStoreEntry>();

  public createThread(): Thread {
    const threadId = randomUUID();
    const now = new Date().toISOString();
    const thread: Thread = {
      id: threadId,
      title: null,
      created_at: now,
      status: { type: 'active' },
      metadata: {},
      items: page([])
    };

    this.threads.set(threadId, { thread, items: [] });
    return thread;
  }

  public hasThread(threadId: string): boolean {
    return this.threads.has(threadId);
  }

  public getThread(threadId: string): Thread | null {
    const entry = this.threads.get(threadId);
    if (!entry) {
      return null;
    }

    return {
      ...entry.thread,
      items: page(entry.items)
    };
  }

  public listThreads(): Thread[] {
    return Array.from(this.threads.values()).map((entry) => ({
      ...entry.thread,
      items: page(entry.items)
    }));
  }

  public listItems(threadId: string): Page<ThreadItem> | null {
    const entry = this.threads.get(threadId);
    if (!entry) {
      return null;
    }
    return page(entry.items);
  }

  public addUserItem(threadId: string, input: UserMessageInput): UserMessageItem | null {
    const entry = this.threads.get(threadId);
    if (!entry) {
      return null;
    }

    const item: UserMessageItem = {
      id: randomUUID(),
      thread_id: threadId,
      created_at: new Date().toISOString(),
      type: 'user_message',
      content: input.content,
      attachments: [],
      quoted_text: input.quoted_text ?? null,
      inference_options: input.inference_options
    };

    entry.items.push(item);
    return item;
  }

  public addAssistantItem(threadId: string, text: string): AssistantMessageItem | null {
    const entry = this.threads.get(threadId);
    if (!entry) {
      return null;
    }

    const item: AssistantMessageItem = {
      id: randomUUID(),
      thread_id: threadId,
      created_at: new Date().toISOString(),
      type: 'assistant_message',
      content: [
        {
          type: 'output_text',
          text,
          annotations: []
        }
      ]
    };

    entry.items.push(item);
    return item;
  }

  public updateThreadTitle(threadId: string, title: string): Thread | null {
    const entry = this.threads.get(threadId);
    if (!entry) {
      return null;
    }
    entry.thread.title = title;
    return this.getThread(threadId);
  }

  public deleteThread(threadId: string): void {
    this.threads.delete(threadId);
  }
}

export function getUserMessageInput(payload: ChatKitRequest): UserMessageInput | null {
  const input = payload.params?.input;
  if (!input || typeof input !== 'object') {
    return null;
  }

  const content = Array.isArray((input as UserMessageInput).content)
    ? (input as UserMessageInput).content
    : [];

  const attachments = Array.isArray((input as UserMessageInput).attachments)
    ? (input as UserMessageInput).attachments
    : [];

  const quotedText = typeof (input as UserMessageInput).quoted_text === 'string'
    ? (input as UserMessageInput).quoted_text
    : null;

  const inferenceOptions =
    typeof (input as UserMessageInput).inference_options === 'object'
      ? (input as UserMessageInput).inference_options
      : {};

  return {
    content,
    attachments,
    quoted_text: quotedText,
    inference_options: inferenceOptions
  };
}

export function extractText(input: UserMessageInput): string {
  return input.content
    .map((part) => (part.type === 'input_text' ? part.text ?? '' : part.text ?? ''))
    .filter(Boolean)
    .join('\n');
}

export function page<T>(data: T[]): Page<T> {
  return {
    data,
    has_more: false,
    after: null
  };
}
