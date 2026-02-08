import fs from "node:fs/promises";
import path from "node:path";

const distPath = path.resolve("dist");

async function clean() {
  await fs.rm(distPath, { recursive: true, force: true });
  // eslint-disable-next-line no-console
  console.log(`Cleaned ${distPath}`);
}

clean().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
