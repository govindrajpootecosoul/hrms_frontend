/**
 * Start Next dev using FRONTEND_PORT from .env / .env.local (project root: projects/frontend).
 */
const path = require('path');
const { spawn } = require('child_process');
const { loadFrontendEnv, assertRequiredFrontendEnv } = require('../../scripts/load-env-frontend');

const appRoot = path.join(__dirname, '..');
loadFrontendEnv(appRoot);
assertRequiredFrontendEnv();

const port = String(process.env.FRONTEND_PORT).trim();
console.log(`Starting Next.js dev on port ${port}`);

const nextDev = spawn('npx', ['next', 'dev', '-H', '0.0.0.0', '-p', port], {
  cwd: appRoot,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

nextDev.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});

nextDev.on('exit', (code) => {
  process.exit(code ?? 0);
});
