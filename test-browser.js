import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log('BROWSER CONSOLE:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE UNCAUGHT EXCEPTION:', error.message);
  });

  const p = path.join(__dirname, 'dist/extension/modules/app/view/index.js');
  const jsContent = fs.readFileSync(p, 'utf8');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <script type="module">
          ${jsContent.replace(/<\/script>/g, '<\\/script>')}
        </script>
      </head>
      <body>
        <app-view></app-view>
      </body>
    </html>
  `);

  await page.waitForTimeout(2000);
  await browser.close();
}
run().catch(console.error);
