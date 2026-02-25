/**
 * OpenAI/Codex model listing helper.
 * The actual Model & ModelProvider come from @openai/agents SDK (OpenAIProvider).
 * This file only provides the static listModels() for the Settings UI.
 */

export class CodexProvider {
  /**
   * List available OpenAI models for the Settings UI.
   * Filters out non-text models (TTS, realtime, whisper, DALL-E, embeddings).
   */
  static async listModels(apiKey: string): Promise<{ id: string; displayName: string }[]> {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await res.json() as any;
    const models = (data.data || [])
      .filter((m: any) => m.id && !m.id.includes('realtime') && !m.id.includes('tts') && !m.id.includes('whisper') && !m.id.includes('dall-e') && !m.id.includes('embedding'))
      .map((m: any) => ({ id: m.id, displayName: m.id }))
      .sort((a: any, b: any) => a.id.localeCompare(b.id));
    console.log(`[codex-provider] Listed ${models.length} models`);
    return models;
  }
}
