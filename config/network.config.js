/**
 * Network Configuration for Main Frontend
 *
 * Reads from environment variables (.env, .env.local — Next loads them before next.config.js).
 *
 * Either set NEXT_PUBLIC_API_URL (e.g. hosted API), or set all of:
 * SERVER_IP, FRONTEND_PORT, BACKEND_PORT for LAN / local backend URL building.
 */

const hasPublicApiUrl = Boolean(
  process.env.NEXT_PUBLIC_API_URL && String(process.env.NEXT_PUBLIC_API_URL).trim()
);

if (!hasPublicApiUrl) {
  if (!process.env.SERVER_IP) {
    throw new Error(
      'Set NEXT_PUBLIC_API_URL in .env or .env.local, or set SERVER_IP (and FRONTEND_PORT, BACKEND_PORT) for local/LAN API URLs.'
    );
  }
  if (!process.env.FRONTEND_PORT) {
    throw new Error('FRONTEND_PORT must be set in .env or .env.local (or set NEXT_PUBLIC_API_URL).');
  }
  if (!process.env.BACKEND_PORT) {
    throw new Error('BACKEND_PORT must be set in .env or .env.local (or set NEXT_PUBLIC_API_URL).');
  }
}

const networkConfig = {
  serverIp: process.env.SERVER_IP || 'localhost',
  frontendPort: parseInt(process.env.FRONTEND_PORT || '3005', 10),
  backendPort: parseInt(process.env.BACKEND_PORT || '5008', 10),
};

// Helper function to get frontend URL
function getFrontendUrl() {
  const host = networkConfig.serverIp === 'localhost' ? 'localhost' : networkConfig.serverIp;
  return `http://${host}:${networkConfig.frontendPort}`;
}

// Helper function to get backend URL
function getBackendUrl() {
  const host = networkConfig.serverIp === 'localhost' ? 'localhost' : networkConfig.serverIp;
  return `http://${host}:${networkConfig.backendPort}`;
}

// Helper function to get API URL
function getApiUrl() {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  return `${getBackendUrl()}/api`;
}

// Export configuration
module.exports = {
  networkConfig,
  getFrontendUrl,
  getBackendUrl,
  getApiUrl,
  // Direct access for convenience
  serverIp: networkConfig.serverIp,
  frontendPort: networkConfig.frontendPort,
  backendPort: networkConfig.backendPort,
  apiUrl: getApiUrl(),
};

