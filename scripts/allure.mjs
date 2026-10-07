// Local Allure workflow helper (cross-platform, no shell-specific commands).
//
//   node scripts/allure.mjs test [playwright args...]  clean allure-results, then run Playwright
//   node scripts/allure.mjs generate                    carry history over, then generate the report
//   node scripts/allure.mjs open                        open the generated report
//
// allure-results is never cleaned by allure-playwright itself, and even
// `playwright test --list` writes a "skipped" result per test, so stale
// results would otherwise mask the real statuses of the latest run.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultsDir = path.join(root, 'allure-results');
const reportDir = path.join(root, 'allure-report');

function run(command, args, options = {}) {
  const { status, error } = spawnSync(command, args, { cwd: root, stdio: 'inherit', ...options });
  if (error) throw error;
  return status ?? 1;
}

function allure(args) {
  // npx resolves the allure-commandline binary (allure / allure.bat)
  return run('npx', ['allure', ...args], { shell: process.platform === 'win32' });
}

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'test': {
    rmSync(resultsDir, { recursive: true, force: true });
    const cli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
    process.exit(run(process.execPath, [cli, 'test', ...args]));
  }
  case 'generate': {
    // Copying the previous report's history into the results is what feeds the Trend widgets.
    const history = path.join(reportDir, 'history');
    if (existsSync(history)) {
      cpSync(history, path.join(resultsDir, 'history'), { recursive: true });
    }
    process.exit(allure(['generate', resultsDir, '--clean', '-o', reportDir]));
  }
  case 'open':
    process.exit(allure(['open', reportDir]));
  default:
    console.error('Usage: node scripts/allure.mjs <test|generate|open> [playwright args...]');
    process.exit(1);
}
