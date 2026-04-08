const { spawn } = require('child_process');
const path = require('path');
const { loadFrontendEnv, assertRequiredFrontendEnv } = require('./scripts/load-env-frontend');

loadFrontendEnv(__dirname);
assertRequiredFrontendEnv();

const port =
  (process.env.PORT && String(process.env.PORT).trim()) ||
  String(process.env.FRONTEND_PORT).trim();

const nextCliPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
const isWindows = process.platform === 'win32';
let command;
let args;

if (isWindows) {
  const nextCmd = path.join(__dirname, 'node_modules', '.bin', 'next.cmd');
  command = nextCmd;
  args = ['start', '-H', '0.0.0.0', '-p', port.toString()];
} else {
  command = 'node';
  args = [nextCliPath, 'start', '-H', '0.0.0.0', '-p', port.toString()];
}

const child = spawn(command, args, {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

child.on('error', (error) => {
  console.error('Failed to start Next.js server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Next.js server exited with code ${code}`);
  }
  process.exit(code || 0);
});
