import fs from 'fs/promises';
import path from 'path';

/**
 * Interface for agent session persistence.
 * Allows saving and loading serialized run states.
 */
export interface PersistenceService {
  /**
   * Saves a serialized session state.
   * @param sessionId - The unique identifier for the session.
   * @param state - The serialized state string.
   */
  saveSession(sessionId: string, state: string): Promise<void>;

  /**
   * Loads a serialized session state.
   * @param sessionId - The unique identifier for the session.
   * @returns The serialized state string, or null if not found.
   */
  loadSession(sessionId: string): Promise<string | null>;

  /**
   * Deletes a session.
   * @param sessionId - The unique identifier for the session.
   */
  deleteSession(sessionId: string): Promise<void>;

  /**
   * Listing all available sessions.
   * @returns Array of sessionIds.
   */
  listSessions(): Promise<string[]>;
}

/**
 * File system implementation of PersistenceService.
 * Stores sessions as JSON files in a dedicated directory.
 */
export class FileSystemPersistence implements PersistenceService {
  private baseDir: string;

  constructor(baseDir?: string) {
    // Default to .runtime/sessions relative to project root
    this.baseDir = baseDir || path.resolve(process.cwd(), '.runtime', 'sessions');
  }

  /**
   * Ensures the storage directory exists.
   */
  private async init(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      // Ignore error if directory already exists
    }
  }

  async saveSession(sessionId: string, state: string): Promise<void> {
    await this.init();
    const filePath = path.join(this.baseDir, `${sessionId}.json`);
    await fs.writeFile(filePath, state, 'utf-8');
  }

  async loadSession(sessionId: string): Promise<string | null> {
    const filePath = path.join(this.baseDir, `${sessionId}.json`);
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const filePath = path.join(this.baseDir, `${sessionId}.json`);
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return;
      }
      throw error;
    }
  }

  async listSessions(): Promise<string[]> {
    await this.init();
    try {
      const files = await fs.readdir(this.baseDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }
}
