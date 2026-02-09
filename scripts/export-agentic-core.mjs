import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

async function exportCore(destDir) {
  const absoluteDest = path.resolve(destDir);
  console.log(`🚀 Iniciando exportación de Agentic Core a: ${absoluteDest}`);

  await fs.mkdir(absoluteDest, { recursive: true });

  const coreFolders = [
    'src/cli',
    'src/runtime',
    'src/mcp',
    'src/infrastructure',
    'src/agentic-system-structure'
  ];

  for (const folder of coreFolders) {
    const src = path.join(ROOT, folder);
    const dest = path.join(absoluteDest, folder);
    console.log(` - Copiando ${folder}...`);
    try {
      await fs.cp(src, dest, {
        recursive: true,
        filter: (src) => !src.includes('/test') && !src.includes('/__tests__')
      });
    } catch (err) {
      console.warn(`⚠️ Advertencia al copiar ${folder}: ${err.message}`);
    }
  }

  // Generar package.json simplificado
  const pkgRaw = await fs.readFile(path.join(ROOT, 'package.json'), 'utf-8');
  const pkg = JSON.parse(pkgRaw);

  const newPkg = {
    name: "agentic-core",
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
    devDependencies: {
      "typescript": pkg.devDependencies["typescript"],
      "@types/node": pkg.devDependencies["@types/node"]
    },
    scripts: {
      "build": "tsc",
      "start": "node src/cli/index.js",
      "mcp": "node src/cli/index.js mcp"
    }
  };

  await fs.writeFile(
    path.join(absoluteDest, 'package.json'),
    JSON.stringify(newPkg, null, 2)
  );

  // Copiar archivos de base necesarios
  const configFiles = ['tsconfig.json', 'README.md', 'LICENSE'];
  for (const file of configFiles) {
    const src = path.join(ROOT, file);
    const dest = path.join(absoluteDest, file);
    if (await fs.stat(src).then(() => true).catch(() => false)) {
      console.log(` - Copiando ${file}...`);
      await fs.copyFile(src, dest);
    }
  }

  // Copiar agentic-system-structure a la raíz del destino para facilitar la resolución
  console.log(' - Configurando agentic-system-structure en la raíz...');
  await fs.cp(path.join(ROOT, 'src/agentic-system-structure'), path.join(absoluteDest, 'agentic-system-structure'), { recursive: true });

  console.log('✅ Exportación completada con éxito.');
}

const target = process.argv[2];
if (!target) {
  console.error('Error: Debes proporcionar una ruta de destino.');
  process.exit(1);
}

exportCore(target).catch(console.error);
