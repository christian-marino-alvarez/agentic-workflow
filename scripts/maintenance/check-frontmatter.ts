
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

async function collectMarkdownFiles(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectMarkdownFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath);
    }
  }
  return files;
}

async function checkDoubleFrontmatter(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  if (lines[0].trim() !== '---') return;

  let dashesCount = 0;
  let secondBlockStart = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashesCount++;
      if (dashesCount === 3) {
        // potential start of second block
        // check if the following lines look like key: value
        if (lines[i + 1] && lines[i + 1].includes(':')) {
          console.log(`[DOUBLE FRONTMATTER DETECTED] ${filePath}`);
          return;
        }
      }
    }
  }
}

async function main() {
  const root = path.resolve('src/agentic-system-structure/workflows');
  const files = await collectMarkdownFiles(root);

  console.log(`Checking ${files.length} files in ${root}...`);

  for (const file of files) {
    await checkDoubleFrontmatter(file);
  }
  console.log('Done.');
}

main();
