/**
 * Start script that uses network.config.js for port configuration
 * 
 * Usage: node scripts/start-with-network-config.js
 * Or: npm run dev:network
 */

const { networkConfig } = require('../config/network.config');
const { spawn } = require('child_process');

// Set PORT environment variable from network config
process.env.PORT = networkConfig.frontendPort.toString();

console.log(`🚀 Starting frontend on port ${networkConfig.frontendPort}`);
console.log(`   Network IP: ${networkConfig.serverIp}`);
console.log(`   Frontend URL: http://${networkConfig.serverIp}:${networkConfig.frontendPort}`);
console.log(`   API URL: http://${networkConfig.serverIp}:${networkConfig.backendPort}/api`);

// Start Next.js dev server
const nextDev = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: networkConfig.frontendPort.toString(),
  },
});

nextDev.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});

nextDev.on('exit', (code) => {
  process.exit(code);
});

