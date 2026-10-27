import { existsSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const standaloneDir = join(root, "..", ".next", "standalone");
const publicDir = join(root, "..", "public");

if (!existsSync(standaloneDir)) {
  console.error(".next/standalone does not exist — run `next build` first.");
  process.exit(1);
}

if (existsSync(publicDir)) {
  cpSync(publicDir, join(standaloneDir, "public"), { recursive: true, force: true });
} else {
  console.log("no public dir, skipping");
  process.exit(0);
}