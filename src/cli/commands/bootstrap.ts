import { intro, outro, spinner, note } from '@clack/prompts';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Bootsrap command to create a standalone copy of the agentic core structure.
 * This allows users to "eject" the system and use it as a boilerplate for a new engine.
 */
export async function bootstrapCommand(destDirArg: string) {
  intro('Agentic System Bootstrapper');

  if (!destDirArg) {
    throw new Error('You must provide a destination directory. Usage: agentic-workflow bootstrap <path>');
  }

  const destDir = path.resolve(destDirArg);
  const s = spinner();
  s.start(`Bootstrapping standalone core to: ${destDir}`);

  try {
    const pkgRoot = await findPackageRoot();

    if (await exists(destDir)) {
      const entries = await fs.readdir(destDir);
      if (entries.length > 0) {
        s.stop('Target directory is not empty.');
        throw new Error(`The destination directory ${destDir} is not empty. Please provide a new or empty folder.`);
      }
    } else {
      await fs.mkdir(destDir, { recursive: true });
    }

    // Define folders to copy based on environment (src/dist)
    const isDevelopment = await exists(path.join(pkgRoot, 'src'));
    const foldersToCopy: { src: string; dest: string }[] = [];

    if (isDevelopment) {
      foldersToCopy.push(
        { src: path.join(pkgRoot, 'src', 'cli'), dest: 'src/cli' },
        { src: path.join(pkgRoot, 'src', 'runtime'), dest: 'src/runtime' },
        { src: path.join(pkgRoot, 'src', 'mcp'), dest: 'src/mcp' },
        { src: path.join(pkgRoot, 'src', 'infrastructure'), dest: 'src/infrastructure' },
        { src: path.join(pkgRoot, 'src', 'agentic-system-structure'), dest: 'src/agentic-system-structure' },
        { src: path.join(pkgRoot, 'src', 'agentic-system-structure'), dest: 'agentic-system-structure' }
      );
    } else {
      // Production (dist structure)
      foldersToCopy.push(
        { src: path.join(pkgRoot, 'dist', 'cli'), dest: 'src/cli' },
        { src: path.join(pkgRoot, 'dist', 'runtime'), dest: 'src/runtime' },
        { src: path.join(pkgRoot, 'dist', 'mcp'), dest: 'src/mcp' },
        { src: path.join(pkgRoot, 'dist', 'infrastructure'), dest: 'src/infrastructure' },
        { src: path.join(pkgRoot, 'dist', 'agent'), dest: 'src/agentic-system-structure' },
        { src: path.join(pkgRoot, 'dist', 'agent'), dest: 'agentic-system-structure' }
      );
    }

    for (const item of foldersToCopy) {
      if (await exists(item.src)) {
        s.message(`Copying ${item.dest}...`);
        await fs.mkdir(path.join(destDir, path.dirname(item.dest)), { recursive: true });
        await fs.cp(item.src, path.join(destDir, item.dest), {
          recursive: true,
          filter: (src) => !src.includes('/test') && !src.includes('/__tests__')
        });
      }
    }

    // Generate package.json
    s.message('Generating package.json...');
    const pkgRaw = await fs.readFile(path.join(pkgRoot, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgRaw);

    const newPkg = {
      name: path.basename(destDir),
      version: pkg.version,
      type: "module",
      bin: { "agentic-workflow": "src/cli/index.js" },
      dependencies: {
        "@clack/prompts": pkg.dependencies["@clack/prompts"],
        "@modelcontextprotocol/sdk": pkg.dependencies["@modelcontextprotocol/sdk"],
        "commander": pkg.dependencies["commander"],
        "gray-matter": pkg.dependencies["gray-matter"],
        "fastify": pkg.dependencies["fastify"],
        "@fastify/autoload": pkg.dependencies["@fastify/autoload"],
        "@fastify/cors": pkg.dependencies["@fastify/cors"]
      },
      scripts: {
        "start": "node src/cli/index.js",
        "mcp": "node src/cli/index.js mcp",
        "init": "node src/cli/index.js init"
      }
    };

    await fs.writeFile(path.join(destDir, 'package.json'), JSON.stringify(newPkg, null, 2));

    // Copy essential config files
    const extras = ['README.md', 'LICENSE', 'tsconfig.json'];
    for (const extra of extras) {
      const src = path.join(pkgRoot, extra);
      if (await exists(src)) {
        await fs.copyFile(src, path.join(destDir, extra));
      }
    }

    s.stop('Bootstrap complete.');
    note(`Standalone Agentic Core scaffolded successfully at:\n${destDir}`, 'Success');
    outro('Happy agent orchestrating!');

  } catch (error: any) {
    s.stop('Bootstrap failed.');
    throw error;
  }
}

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function findPackageRoot(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  let curr = path.dirname(__filename);
  while (curr !== path.dirname(curr)) {
    if (await exists(path.join(curr, 'package.json'))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  throw new Error('Project root not found.');
}
