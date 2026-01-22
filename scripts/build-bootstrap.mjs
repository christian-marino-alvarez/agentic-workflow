import fs from "node:fs/promises";
import path from "node:path";

const distRoot = path.resolve("dist");
const outPath = path.join(distRoot, "bootstrap.md");

const files = [
  { rel: "index.md", alias: "agent.index" },
  { rel: "rules/index.md", alias: "rules.index" },
  { rel: "rules/constitution/index.md", alias: "rules.constitution.index" },
  { rel: "rules/constitution/GEMINI.location.md", alias: "constitution.GEMINI_location" },
  { rel: "rules/constitution/extensio-architecture.md", alias: "constitution.extensio_architecture" },
  { rel: "rules/constitution/clean-code.md", alias: "constitution.clean_code" },
  { rel: "rules/roles/architect.md", alias: "roles.architect" },
];

async function readCoreFile(rel, alias) {
  const filePath = path.join(distRoot, rel);
  const content = await fs.readFile(filePath, "utf-8");
  return { rel, alias, content };
}

async function build() {
  await fs.mkdir(distRoot, { recursive: true });
  const entries = [];
  for (const entry of files) {
    entries.push(await readCoreFile(entry.rel, entry.alias));
  }

  let bundle = "# BOOTSTRAP BUNDLE (MINIMAL)\n\n";
  bundle += "## MANIFIESTO DE CARGA\n";
  bundle += "Este bundle contiene los siguientes dominios de contexto:\n";
  for (const entry of entries) {
    bundle += `- [x] \`${entry.alias}\` (<core>/${entry.rel})\n`;
  }
  bundle += "\n---\n\n";

  for (const entry of entries) {
    bundle += `## FILE: ${entry.alias}\n`;
    bundle += `Path: \`<core>/${entry.rel}\`\n\n`;
    bundle += "```markdown\n";
    bundle += entry.content;
    if (!entry.content.endsWith("\n")) bundle += "\n";
    bundle += "```\n\n---\n\n";
  }

  await fs.writeFile(outPath, bundle);
  // eslint-disable-next-line no-console
  console.log(`Bootstrap generado en ${outPath}`);
}

build().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
