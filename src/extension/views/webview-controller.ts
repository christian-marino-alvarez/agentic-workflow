export class WebviewController {
  protected readonly root: Document;

  public constructor() {
    this.root = document;
  }

  protected byId<T extends HTMLElement>(id: string): T | null {
    return this.root.getElementById(id) as T | null;
  }

  protected hide(element: HTMLElement | null): void {
    if (element) {
      element.hidden = true;
    }
  }

  protected show(element: HTMLElement | null): void {
    if (element) {
      element.hidden = false;
    }
  }
}
