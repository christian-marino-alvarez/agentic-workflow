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
 */
export interface Message {
  to: string;
  from: string;
  origin: MessageOrigin;
  timestamp: number;
  payload: Payload;
}

export type MessageHandler = (message: Message) => void | Promise<void>;

/**
 * Interface for the underlying transport mechanism (e.g., VS Code Webview or inter-process).
 */
export interface IMessageTransport {
  postMessage(message: any): void | Promise<any>;
  onMessage(callback: MessageHandler): Disposable;
}

