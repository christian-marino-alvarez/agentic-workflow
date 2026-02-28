import * as vscode from 'vscode';

/**
 * Log tags for structured filtering.
 * Each tag represents a domain/concern in the communication flow.
 */
export const LOG_TAGS = {
  MSG: '#msg',           // View ↔ Background message boundaries
  WORKFLOW: '#workflow', // Workflow engine state transitions
  LLM: '#llm',          // LLM API calls, streams, model resolution
  PROMPT: '#prompt',    // Prompt building: sections, constitutions
  INTENT: '#intent',    // A2UI intent parsing and resolution
  SESSION: '#session',  // Session save/load/delete/new
  GATE: '#gate',        // Gate approval/rejection handling
  LIFECYCLE: '#lifecycle', // Phase transitions, auto-start
  CONFIG: '#config',    // Settings cache, model config
  SYSTEM: '#system',    // Initialization, sidecar spawn
} as const;

export type LogTag = typeof LOG_TAGS[keyof typeof LOG_TAGS];

/**
 * Standardized logger for the Agentic Workflow extension.
 * Provides a centralized VS Code Output Channel with tag-based filtering.
 *
 * Tags enable filtering by concern:
 *   Logger.log('[chat::bg] Message sent', '#msg')
 *   Logger.setFilter('#msg') → only #msg logs shown in Output Channel
 *   Logger.setFilter(null)   → show all
 */
export class Logger {
  private static channel: vscode.OutputChannel | undefined;
  private static activeFilter: string | null = null;
  private static sessionId: string = '';

  /**
   * Set the active session ID. All subsequent logs include this.
   */
  public static setSession(id: string): void {
    this.sessionId = id;
  }

  /**
   * Short session label for log lines (first 4 chars or '----').
   */
  public static getSessionLabel(): string {
    return this.sessionId ? `s:${this.sessionId.slice(0, 4)}` : 's:----';
  }

  /**
   * Initialize the output channel.
   */
  public static init(name: string): void {
    if (!this.channel) {
      this.channel = vscode.window.createOutputChannel(name);
    }
    this.channel.show(true);
    this.log('Logger initialized in Output Channel');
  }

  /**
   * Log a message with optional tag for filtering.
   *
   * @param message  Log message (should include layer prefix like [chat::background])
   * @param tagOrArg Optional tag string (starts with #) or first extra arg
   * @param args     Additional arguments to log
   */
  public static log(message: string, tagOrArg?: string | any, ...args: any[]): void {
    let tag: string | undefined;
    let extraArgs: any[];

    // Detect if second arg is a tag (starts with #)
    if (typeof tagOrArg === 'string' && tagOrArg.startsWith('#')) {
      tag = tagOrArg;
      extraArgs = args;
    } else if (tagOrArg !== undefined) {
      tag = undefined;
      extraArgs = [tagOrArg, ...args];
    } else {
      tag = undefined;
      extraArgs = [];
    }

    const timestamp = new Date().toLocaleTimeString();
    const tagLabel = tag ? ` [${tag}]` : '';
    const formattedArgs = extraArgs.length > 0
      ? ` | ${extraArgs.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')}`
      : '';

    const fullMessage = `[${timestamp}] [${this.getSessionLabel()}]${tagLabel} ${message}${formattedArgs}`;

    // Always write to Debug Console
    console.log(fullMessage);

    // Apply filter: skip Output Channel if filter is active and tag doesn't match
    if (this.activeFilter && tag !== this.activeFilter) {
      return;
    }

    this.channel?.appendLine(fullMessage);
  }

  /**
   * Set the active tag filter. Only logs with matching tag will appear in Output Channel.
   * Set to null to show all logs.
   */
  public static setFilter(tag: string | null): void {
    this.activeFilter = tag;
    const label = tag ? `Filter active: ${tag}` : 'Filter cleared — showing all logs';
    this.channel?.appendLine(`──── ${label} ────`);
  }

  /**
   * Get the current active filter.
   */
  public static getFilter(): string | null {
    return this.activeFilter;
  }

  /**
   * Focus the output channel.
   */
  public static show(): void {
    this.channel?.show();
  }

  /**
   * Register the VS Code command for tag filtering.
   * Call this during extension activation.
   */
  public static registerFilterCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand('agenticWorkflow.filterLogs', async () => {
      const tags = Object.values(LOG_TAGS);
      const items = [
        { label: '$(clear-all) Show All', description: 'Remove filter — show all logs', value: null as string | null },
        { label: '', kind: vscode.QuickPickItemKind.Separator } as any,
        ...tags.map(tag => ({
          label: tag,
          description: TAG_DESCRIPTIONS[tag] || '',
          value: tag as string | null,
        })),
      ];

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: Logger.activeFilter
          ? `Active filter: ${Logger.activeFilter} — select new filter or Show All`
          : 'Select a tag to filter logs',
        title: 'Agentic: Filter Logs',
      });

      if (selected) {
        Logger.setFilter(selected.value);
      }
    });

    context.subscriptions.push(disposable);
  }
}

/** Human-readable descriptions for each tag (used in QuickPick). */
const TAG_DESCRIPTIONS: Record<string, string> = {
  '#msg': 'View ↔ Background message flow',
  '#workflow': 'Workflow engine state transitions',
  '#llm': 'LLM API calls and streams',
  '#prompt': 'Prompt building and constitutions',
  '#intent': 'A2UI intent parsing',
  '#session': 'Session save/load/delete',
  '#gate': 'Gate approval/rejection',
  '#lifecycle': 'Phase transitions',
  '#config': 'Settings and model config',
  '#system': 'Initialization and sidecar',
};
