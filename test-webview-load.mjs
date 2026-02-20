import { JSDOM } from 'jsdom';
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`, { url: "http://localhost/" });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;
global.location = dom.window.location;
global.Event = dom.window.Event;

try {
  await import('./dist/extension/modules/app/view/index.js');
  console.log("Webview JS loaded successfully without top-level errors");
} catch(e) {
  console.error("Webview JS failed to load:", e);
}
