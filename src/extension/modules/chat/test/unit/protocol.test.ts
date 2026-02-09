import { describe, it, expect } from 'vitest';
import {
  ChatKitThreadStore,
  extractText,
  getUserMessageInput,
  page,
  type UserMessageInput,
  type ChatKitRequest
} from '../../backend/chatkit/protocol.js';

const sampleInput: UserMessageInput = {
  content: [
    { type: 'input_text', text: 'Hello' },
    { type: 'input_text', text: 'World' }
  ],
  attachments: [],
  quoted_text: null,
  inference_options: { model: 'gpt-5' }
};

describe('ChatKit Protocol', () => {
  it('page wraps data with defaults', () => {
    const data = page([1, 2, 3]);
    expect(data).toEqual({ data: [1, 2, 3], has_more: false, after: null });
  });

  it('extractText joins input text content', () => {
    const text = extractText(sampleInput);
    expect(text).toBe('Hello\nWorld');
  });

  it('getUserMessageInput parses payload input', () => {
    const payload: ChatKitRequest = { type: 'threads_create', params: { input: sampleInput } };
    const parsed = getUserMessageInput(payload);
    expect(parsed).toEqual(sampleInput);
  });

  it('thread store creates thread and adds items', () => {
    const store = new ChatKitThreadStore();
    const thread = store.createThread();
    expect(thread.id).toBeDefined();
    expect(store.hasThread(thread.id)).toBe(true);

    const userItem = store.addUserItem(thread.id, sampleInput);
    expect(userItem).toBeTruthy();
    expect(userItem?.type).toBe('user_message');

    const assistantItem = store.addAssistantItem(thread.id, 'Response');
    expect(assistantItem).toBeTruthy();
    expect(assistantItem?.content[0]?.text).toBe('Response');

    const items = store.listItems(thread.id);
    expect(items?.data.length).toBe(2);
  });

  it('thread store updates and deletes', () => {
    const store = new ChatKitThreadStore();
    const thread = store.createThread();
    const updated = store.updateThreadTitle(thread.id, 'New title');
    expect(updated?.title).toBe('New title');

    store.deleteThread(thread.id);
    expect(store.hasThread(thread.id)).toBe(false);
  });
});
