/**
 * PromptPipeline — Declarative prompt composition with named segments.
 *
 * Segments are composed in insertion order (first = highest priority for
 * prefix caching). Each segment has a name for debug/logging.
 *
 * Usage:
 *   const persona = new PromptPipeline()
 *     .add('preamble', behavioralPreamble(...))
 *     .add('instructions', defineResponseSchema())
 *     .addIf(!!lang, 'language', languageBlock)
 *     .build();
 */
export class PromptPipeline {
  private segments: { name: string; content: string }[] = [];

  /** Add a named segment to the pipeline. */
  add(name: string, content: string): this {
    if (content) {
      this.segments.push({ name, content });
    }
    return this;
  }

  /** Add a named segment only if the condition is true. */
  addIf(condition: boolean, name: string, content: string): this {
    if (condition && content) {
      this.segments.push({ name, content });
    }
    return this;
  }

  /** Build the final prompt string by joining all segments. */
  build(): string {
    return this.segments.map(s => s.content).join('\n\n');
  }

  /** Return debug info: segment names and their character counts. */
  debug(): { name: string; chars: number }[] {
    return this.segments.map(s => ({ name: s.name, chars: s.content.length }));
  }
}
