import { Disposable } from 'vscode';
import { MessageOrigin } from './constants.js';

/**
 * Standardized Payload structure.
 */
export interface Payload {
  command: string;
  data: any;
}

/**
 * Origin of a message.
 */
export type MessageOrigin = typeof MessageOrigin[keyof typeof MessageOrigin];

/**
 * Standardized Message structure for cross-component communication.
 * - `id`: Unique identifier for this message (used for correlation).
 * - `correlationId`: If this is a response, links back to the original request's `id`.
 */
export interface Message {
  id: string;
  to: string;
  from: string;
  origin: MessageOrigin;
  timestamp: number;
  payload: Payload;
  correlationId?: string;
}

export type MessageHandler = (message: Message) => void | Promise<void>;

/**
 * Interface for the underlying transport mechanism (e.g., VS Code Webview or inter-process).
 */
export interface IMessageTransport {
  postMessage(message: any): void | Promise<any>;
  postMessage(message: any): void | Promise<any>;
  onMessage(callback: MessageHandler): Disposable;
}

/**
 * Agnostic Authentication Session interface.
 * Decouples modules from vscode.AuthenticationSession.
 */
export interface IAuthenticationSession {
  id: string;
  accessToken: string;
  account: { label: string; id: string };
  scopes: readonly string[];
}

