import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const projectRoot = process.cwd();
const target = path.join(projectRoot, "node_modules", ".prisma");

try {
  const prismaClientPackage = require.resolve("@prisma/client/package.json");
  const prismaClientDir = path.dirname(prismaClientPackage);
  const generatedDir = path.resolve(prismaClientDir, "..", "..", ".prisma");

  if (!fs.existsSync(generatedDir)) {
    console.warn(`[prisma-link] Generated Prisma directory not found at ${generatedDir}.`);
    process.exit(0);
  }

  if (fs.existsSync(target)) {
    process.exit(0);
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  const linkType = process.platform === "win32" ? "junction" : "dir";
  fs.symlinkSync(generatedDir, target, linkType);
  console.log(`[prisma-link] Linked ${target} -> ${generatedDir}`);
} catch (error) {
  console.warn("[prisma-link] Skipped linking .prisma directory.");
  console.warn(error instanceof Error ? error.message : String(error));
}
