const { spawn } = require('child_process');
const path = require('path');
const { loadFrontendEnv, assertRequiredFrontendEnv, printDevHint } = require('./load-env-frontend');

const root = path.join(__dirname, '..');
loadFrontendEnv(root);
assertRequiredFrontendEnv();
printDevHint();

const port = String(process.env.FRONTEND_PORT).trim();
const child = spawn('npx', ['next', 'dev', '-H', '0.0.0.0', '-p', port], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 0));
