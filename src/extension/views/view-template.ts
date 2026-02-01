export type TemplateReplacements = Record<string, string>;

export class ViewTemplate {
  private readonly template: string;

  public constructor(template: string) {
    this.template = template;
  }

  public render(replacements: TemplateReplacements): string {
    return Object.keys(replacements).reduce((current, token) => {
      return current.replace(new RegExp(token, 'g'), replacements[token]);
    }, this.template);
  }
}
