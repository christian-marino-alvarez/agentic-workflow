const { chromium } = require('playwright');
const path = require('path');
const { exec } = require('child_process');

async function run() {
  // Use the vscode executable to run playwright? No, Playwright test runner handles it.
  // We can just run the test file using Playwright, but pass an env var and modify the test to listen to console.
}
run();
