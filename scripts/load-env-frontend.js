const fs = require('fs');
const path = require('path');

function loadEnvFile(rootDir, filename, overrideExisting) {
  const filePath = path.join(rootDir, filename);
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (overrideExisting || process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch {
    // optional file
  }
}

/**
 * Load .env then .env.local (.env.local overrides .env, same as Next.js).
 */
function loadFrontendEnv(rootDir = path.join(__dirname, '..')) {
  loadEnvFile(rootDir, '.env', false);
  loadEnvFile(rootDir, '.env.local', true);
}

function assertRequiredFrontendEnv() {
  const api = process.env.NEXT_PUBLIC_API_URL && String(process.env.NEXT_PUBLIC_API_URL).trim();
  if (!api) {
    console.error('FATAL: NEXT_PUBLIC_API_URL is required in .env or .env.local (backend API base URL, e.g. http://localhost:5008/api).');
    process.exit(1);
  }
  const port = process.env.FRONTEND_PORT && String(process.env.FRONTEND_PORT).trim();
  if (!port) {
    console.error('FATAL: FRONTEND_PORT is required in .env or .env.local (no default port in scripts).');
    process.exit(1);
  }
}

function printDevHint() {
  const p = String(process.env.FRONTEND_PORT).trim();
  const serverIp = (process.env.SERVER_IP && String(process.env.SERVER_IP).trim()) || '';
  console.log('');
  console.log('  --- Open in browser (do NOT use 0.0.0.0) ---');
  console.log(`  This PC:     http://localhost:${p}`);
  if (serverIp && serverIp !== 'localhost') {
    console.log(`  Phone / LAN: http://${serverIp}:${p}`);
  }
  console.log('');
}

module.exports = {
  loadFrontendEnv,
  assertRequiredFrontendEnv,
  printDevHint,
};
