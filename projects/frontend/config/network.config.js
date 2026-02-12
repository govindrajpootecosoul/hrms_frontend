/**
 * Network Configuration for Frontend
 * 
 * ⚠️ IMPORTANT: Update only this file to change network settings
 * This is the SINGLE SOURCE OF TRUTH for frontend network configuration
 * 
 * To change network settings:
 * 1. Update SERVER_IP, FRONTEND_PORT, and BACKEND_PORT below
 * 2. Or set environment variables: SERVER_IP, FRONTEND_PORT, BACKEND_PORT
 */

const networkConfig = {
  // Server IP Address (change this to your network IP)
  // Examples: '192.168.50.107', '192.168.1.100', 'localhost'
  serverIp: process.env.SERVER_IP || '192.168.50.107',
  
  // Frontend Port (change this to your desired port)
  frontendPort: parseInt(process.env.FRONTEND_PORT) || 3000,
  
  // Backend Port (must match backend network.config.js)
  backendPort: parseInt(process.env.BACKEND_PORT) || 5008,
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

