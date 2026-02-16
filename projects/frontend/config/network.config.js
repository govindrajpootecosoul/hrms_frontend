/**
 * Network Configuration for Frontend
 * 
 * ⚠️ IMPORTANT: Update .env.local file to change network settings
 * This file reads from environment variables only
 * 
 * To change network settings:
 * Update SERVER_IP, FRONTEND_PORT, and BACKEND_PORT in .env.local file
 */

// Validate required environment variables
if (!process.env.SERVER_IP) {
  throw new Error('SERVER_IP must be set in .env.local file');
}
if (!process.env.FRONTEND_PORT) {
  throw new Error('FRONTEND_PORT must be set in .env.local file');
}
if (!process.env.BACKEND_PORT) {
  throw new Error('BACKEND_PORT must be set in .env.local file');
}

const networkConfig = {
  // Server IP Address (must be set in .env.local file)
  serverIp: process.env.SERVER_IP,
  
  // Frontend Port (must be set in .env.local file)
  frontendPort: parseInt(process.env.FRONTEND_PORT),
  
  // Backend Port (must be set in .env.local file)
  backendPort: parseInt(process.env.BACKEND_PORT),
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

