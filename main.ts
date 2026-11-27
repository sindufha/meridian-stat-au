// Meridian — Australia National Statistics entrypoint (Node 22+, stdlib only).
// Copies the static web application (app/) and browser captures (screenshots/) to the
// target output directory and emits a deterministic dossier.json via the vendored library.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
} as const;

function copyTreeIfPresent(sourceDir: string, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });
  if (existsSync(sourceDir)) {
    cpSync(sourceDir, targetDir, { recursive: true });
  }
}

function run(): void {
  mkdirSync(outputDir, { recursive: true });
  copyTreeIfPresent(join(repoRoot, 'app'), join(outputDir, 'app'));
  copyTreeIfPresent(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

  const dossierBytes = buildDossier(outputDir, DOSSIER_CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
}

run();
