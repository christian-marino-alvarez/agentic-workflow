import fs from 'node:fs/promises';
import path from 'node:path';

const root = 'src/agentic-system-structure';
const mode = process.argv.includes('--apply') ? 'apply' : 'dry';

const skipDirs = new Set(['node_modules', '.git']);

const entries = [];

async function walk(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const item of items) {
    if (skipDirs.has(item.name)) {
      continue;
    }
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      await walk(full);
      continue;
    }
    if (item.isFile() && item.name.endsWith('.md')) {
      entries.push(full);
    }
  }
}

function classifyKind(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  if (normalized.includes('/workflows/')) {
    return 'workflow';
  }
  if (normalized.includes('/rules/')) {
    return 'rule';
  }
  if (normalized.includes('/templates/')) {
    return 'template';
  }
  if (normalized.includes('/artifacts/')) {
    return 'artifact';
  }
  if (normalized.endsWith('/index.md')) {
    return 'index';
  }
  return 'document';
}

function buildFrontmatter(filePath) {
  const kind = classifyKind(filePath);
  const name = path.basename(filePath, '.md');
  return `---\nkind: ${kind}\nname: ${name}\nsource: agentic-system-structure\n---\n\n`;
}

function hasFrontmatter(content) {
  return content.startsWith('---\n');
}

await walk(root);

const withoutFrontmatter = [];

for (const filePath of entries) {
  const content = await fs.readFile(filePath, 'utf8');
  if (!hasFrontmatter(content)) {
    withoutFrontmatter.push(filePath);
    if (mode === 'apply') {
      const frontmatter = buildFrontmatter(filePath);
      await fs.writeFile(filePath, frontmatter + content);
    }
  }
}

console.log(`mode: ${mode}`);
console.log(`total_md: ${entries.length}`);
console.log(`without_frontmatter: ${withoutFrontmatter.length}`);
if (withoutFrontmatter.length > 0) {
  console.log('sample:');
  console.log(withoutFrontmatter.slice(0, 20).join('\n'));
}
