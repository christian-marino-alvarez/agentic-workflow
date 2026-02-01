import test from 'node:test';
import assert from 'node:assert/strict';
import { ViewTemplate } from '../dist/extension/views/view-template.js';
import { ChatViewTemplate } from '../dist/extension/views/chat/chat-view.template.js';
import { KeyViewTemplate } from '../dist/extension/views/key/key-view.template.js';
import { HistoryViewTemplate } from '../dist/extension/views/history/history-view.template.js';
import { WorkflowViewTemplate } from '../dist/extension/views/workflow/workflow-view.template.js';

const assertNoToken = (html, token) => {
  assert.ok(!html.includes(token), `Token not replaced: ${token}`);
};

test('ViewTemplate replaces tokens', () => {
  const template = new ViewTemplate('Hello __NAME__ and __NAME__');
  const html = template.render({ '__NAME__': 'Neo' });
  assert.equal(html, 'Hello Neo and Neo');
});

test('ChatViewTemplate renders with required tokens', () => {
  const template = new ChatViewTemplate();
  const html = template.render({
    nonce: 'nonce-value',
    scriptUri: 'vscode-resource://script.js',
    apiUrl: 'http://localhost:3000/chatkit',
    apiOrigin: 'http://localhost:3000'
  });

  assert.ok(html.includes('data-api-url="http://localhost:3000/chatkit"'));
  assert.ok(html.includes('connect-src http://localhost:3000;'));
  assert.ok(html.includes('nonce="nonce-value"'));
  assert.ok(html.includes('src="vscode-resource://script.js"'));
  assertNoToken(html, '__NONCE__');
  assertNoToken(html, '__SCRIPT_URI__');
  assertNoToken(html, '__API_URL__');
  assertNoToken(html, '__API_ORIGIN__');
});

test('KeyViewTemplate renders with required tokens', () => {
  const template = new KeyViewTemplate();
  const html = template.render({
    nonce: 'key-nonce',
    scriptUri: 'vscode-resource://key.js'
  });

  assert.ok(html.includes('nonce="key-nonce"'));
  assert.ok(html.includes('src="vscode-resource://key.js"'));
  assertNoToken(html, '__NONCE__');
  assertNoToken(html, '__SCRIPT_URI__');
});

test('HistoryViewTemplate renders with required tokens', () => {
  const template = new HistoryViewTemplate();
  const html = template.render({
    nonce: 'history-nonce',
    scriptUri: 'vscode-resource://history.js'
  });

  assert.ok(html.includes('nonce="history-nonce"'));
  assert.ok(html.includes('src="vscode-resource://history.js"'));
  assertNoToken(html, '__NONCE__');
  assertNoToken(html, '__SCRIPT_URI__');
});

test('WorkflowViewTemplate renders with required tokens', () => {
  const template = new WorkflowViewTemplate();
  const html = template.render({
    nonce: 'workflow-nonce',
    scriptUri: 'vscode-resource://workflow.js'
  });

  assert.ok(html.includes('nonce="workflow-nonce"'));
  assert.ok(html.includes('src="vscode-resource://workflow.js"'));
  assertNoToken(html, '__NONCE__');
  assertNoToken(html, '__SCRIPT_URI__');
});
