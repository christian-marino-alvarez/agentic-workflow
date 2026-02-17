import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ChatKitThreadStore,
  extractText,
  getUserMessageInput,
  page
} from '../dist/extension/chatkit/chatkit-protocol.js';

const sampleInput = {
  content: [
    { type: 'input_text', text: 'Hello' },
    { type: 'input_text', text: 'World' }
  ],
  attachments: [],
  quoted_text: null,
  inference_options: { model: 'gpt-5' }
};

test('page wraps data with defaults', () => {
  const data = page([1, 2, 3]);
  assert.deepEqual(data, { data: [1, 2, 3], has_more: false, after: null });
});

test('extractText joins input text content', () => {
  const text = extractText(sampleInput);
  assert.equal(text, 'Hello\nWorld');
});

test('getUserMessageInput parses payload input', () => {
  const payload = { type: 'threads.create', params: { input: sampleInput } };
  const parsed = getUserMessageInput(payload);
  assert.deepEqual(parsed, sampleInput);
});

test('thread store creates thread and adds items', () => {
  const store = new ChatKitThreadStore();
  const thread = store.createThread();
  assert.ok(thread.id);
  assert.equal(store.hasThread(thread.id), true);

  const userItem = store.addUserItem(thread.id, sampleInput);
  assert.ok(userItem);
  assert.equal(userItem?.type, 'user_message');

  const assistantItem = store.addAssistantItem(thread.id, 'Response');
  assert.ok(assistantItem);
  assert.equal(assistantItem?.content[0]?.text, 'Response');

  const items = store.listItems(thread.id);
  assert.equal(items?.data.length, 2);
});

test('thread store updates and deletes', () => {
  const store = new ChatKitThreadStore();
  const thread = store.createThread();
  const updated = store.updateThreadTitle(thread.id, 'New title');
  assert.equal(updated?.title, 'New title');

  store.deleteThread(thread.id);
  assert.equal(store.hasThread(thread.id), false);
});
