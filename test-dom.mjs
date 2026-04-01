import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.customElements = window.customElements;
global.CSSStyleSheet = window.CSSStyleSheet;
if (!global.CSSStyleSheet) {
  global.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() { }
  };
}

try {
  await import('./dist/extension/modules/app/view/index.js');
  console.log("SUCCESS!");
} catch (err) {
  console.error("IMPORT ERROR:", err);
}
