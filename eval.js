const { DOMParser } = require('xmldom');
const html = "```html\n<a2ui type=\"artifact\" id=\"x\" label=\"y\">\nsummary\n</a2ui>\n```";
const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, 'text/xml');
console.log(doc.getElementsByTagName('a2ui')[0]?.getAttribute('type'));
