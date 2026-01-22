import fs from "node:fs/promises";
import path from "node:path";

const distRoot = path.resolve("dist");
const outPath = path.join(distRoot, "bootstrap.md");

const files = [
  { rel: "rules/constitution/GEMINI.location.md", alias: "constitution.GEMINI_location" },
  { rel: "rules/constitution/extensio-architecture.md", alias: "constitution.extensio_architecture" },
  { rel: "rules/constitution/clean-code.md", alias: "constitution.clean_code" },
];

async function readFile(rel, alias) {
  const filePath = path.join(distRoot, rel);
  const content = await fs.readFile(filePath, "utf-8");
  return { rel, alias, content };
}

async function build() {
  await fs.mkdir(distRoot, { recursive: true });
  const entries = [];
  for (const entry of files) {
    entries.push(await readFile(entry.rel, entry.alias));
  }

  let bundle = "# BOOTSTRAP (TEST)\n\n";
  bundle += "Este bootstrap contiene las constituciones base.\n";
  bundle += "No es necesario recargarlas durante el init.\n\n";
  bundle += "## Sistema de indexacion\n";
  bundle += "El sistema usa indices y alias definidos en `.agent/index.md`.\n";
  bundle += "Si necesitas navegar dominios, carga ese index y sigue la cadena:\n";
  bundle += "`.agent/index.md` -> `dominio/index.md` -> alias -> ruta real.\n\n";
  bundle += "## CONSTITUTIONS INCLUIDAS\n\n";

  for (const entry of entries) {
    bundle += `## FILE: ${entry.alias}\n`;
    bundle += `Path: \`.agent/${entry.rel}\`\n\n`;
    bundle += "```markdown\n";
    bundle += entry.content;
    if (!entry.content.endsWith("\n")) bundle += "\n";
    bundle += "```\n\n---\n\n";
  }

  await fs.writeFile(outPath, bundle);
  // eslint-disable-next-line no-console
  console.log(`Bootstrap de pruebas generado en ${outPath}`);
}

build().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
