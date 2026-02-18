import { TemplateResult } from 'lit';

/**
 * Public interface for ChatView — used by templates to avoid circular imports.
 */
export interface IChatView {
  history: string[];
  inputText: string;
  handleInput(e: InputEvent): void;
  handleKeyDown(e: KeyboardEvent): void;
  sendChatMessage(): void;
}
