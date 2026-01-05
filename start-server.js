const { spawn } = require('child_process');
const path = require('path');

const port = process.env.PORT || 4000;
// Use the actual Next.js CLI file, not the shell script
const nextCliPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

// On Windows, we need to use the .cmd file or node directly
const isWindows = process.platform === 'win32';
let command, args;

if (isWindows) {
  // Try using next.cmd first, fallback to node with the CLI
  const nextCmd = path.join(__dirname, 'node_modules', '.bin', 'next.cmd');
  command = nextCmd;
  args = ['start', '-p', port.toString()];
} else {
  command = 'node';
  args = [nextCliPath, 'start', '-p', port.toString()];
}

const child = spawn(command, args, {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
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

