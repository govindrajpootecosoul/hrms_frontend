/**
 * CENTRALIZED DATABASE CONFIGURATION
 * 
 * ⚠️ IMPORTANT: Change MongoDB connection details here and it will update across ALL portals
 * 
 * This file is the single source of truth for database connections.
 * All MongoDB connections in the project should use this configuration.
 * update chnage in new branch
 */

// ============================================
// MONGODB CONFIGURATION
// ============================================
// Change these values to update MongoDB connection across the entire project
export const MONGODB_CONFIG = {
  // MongoDB Server Details
  host: process.env.MONGO_HOST || process.env.NEXT_PUBLIC_MONGO_HOST || 'localhost',
  port: parseInt(process.env.MONGO_PORT || process.env.NEXT_PUBLIC_MONGO_PORT || '27012', 10),
  
  // Full URI (if set, will override host:port)
  uri: process.env.MONGO_URI || process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGO_URI || null,
  
  // Database Names
  // NEW (single-connection multi-DB):
  // We use ONE database per company (e.g., "ecosoul", "thrive") inside the same Mongo instance.
  // Portals are separated by COLLECTIONS inside that company DB (not separate DBs like ecosoul_asset_tracker).
  databases: {
    // These are kept for backward compatibility, but in the new setup they are NOT used to create per-portal DBs.
    assetTracker: process.env.MONGO_DB_NAME || process.env.MONGODB_DB_NAME || process.env.NEXT_PUBLIC_MONGO_DB_NAME || 'asset_tracker',
    login: process.env.MONGO_LOGIN_DB_NAME || 'Employees_List',
    employee: process.env.MONGO_EMPLOYEE_DB_NAME || 'Employee',
    queryTracker: process.env.QUERY_TRACKER_DB_NAME || 'query_tracker',
    hrms: process.env.HRMS_DB_NAME || process.env.NEXT_PUBLIC_HRMS_DB_NAME || 'hrms',
    finance: process.env.FINANCE_DB_NAME || process.env.NEXT_PUBLIC_FINANCE_DB_NAME || 'finance',
  },
  
  // Collection Names
  collections: {
    assets: 'assets',
    users: 'users',
  },
  
  // Connection Options
  options: {
    maxPoolSize: 10,
    connectTimeoutMS: 15000,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get MongoDB connection URI
 * @param {string} databaseName - Optional database name to append
 * @returns {string} MongoDB connection URI
 */
export function getMongoUri(databaseName = null) {
  // If full URI is provided, use it
  if (MONGODB_CONFIG.uri) {
    if (databaseName && !MONGODB_CONFIG.uri.includes('/' + databaseName)) {
      const separator = MONGODB_CONFIG.uri.endsWith('/') ? '' : '/';
      return `${MONGODB_CONFIG.uri}${separator}${databaseName}`;
    }
    return MONGODB_CONFIG.uri;
  }
  
  // Construct URI from host and port
  const baseUri = `mongodb://${MONGODB_CONFIG.host}:${MONGODB_CONFIG.port}`;
  return databaseName ? `${baseUri}/${databaseName}` : baseUri;
}

/**
 * Get company name from email domain
 * @param {string} email - User email address
 * @returns {string|null} Company name ('Thrive' or 'Ecosoul Home') or null
 */
export function getCompanyFromEmail(email) {
  if (!email) return null;
  const emailLower = email.toLowerCase();
  if (emailLower.endsWith('@thrivebrands.ai')) {
    return 'Thrive';
  } else if (emailLower.endsWith('@ecosoulhome.com')) {
    return 'Ecosoul Home';
  }
  return null;
}

/**
 * Canonical company DB name (must be a valid Mongo DB name: no spaces).
 * Defaults:
 * - Thrive        -> "thrive"
 * - Ecosoul Home  -> "ecosoul"
 *
 * Override via env:
 * - NEXT_PUBLIC_MONGO_COMPANY_DB_THRIVE
 * - NEXT_PUBLIC_MONGO_COMPANY_DB_ECOSOUL
 */
export function normalizeCompanyDbName(company) {
  if (!company || typeof company !== 'string') return '';
  const t = company.trim().toLowerCase();
  if (t.includes('thrive'))
    return (process.env.NEXT_PUBLIC_MONGO_COMPANY_DB_THRIVE || 'thrive').trim();
  if (t.includes('ecosoul') || t.includes('eco soul'))
    return (process.env.NEXT_PUBLIC_MONGO_COMPANY_DB_ECOSOUL || 'ecosoul').trim();
  return company.trim().replace(/\s+/g, '_');
}

/**
 * Get company-specific database name
 * @param {string} module - Module name: 'assetTracker', 'hrms', 'finance', 'queryTracker', 'employee'
 * @param {string} company - Company name: 'Thrive' or 'Ecosoul Home'
 * @returns {string} Company-specific database name
 * 
 * Examples:
 *   - getCompanyDatabaseName('assetTracker', 'Ecosoul Home') => 'ecosoul'
 *   - getCompanyDatabaseName('hrms', 'Thrive') => 'thrive'
 *   - getCompanyDatabaseName('finance', 'Ecosoul Home') => 'ecosoul'
 *   - getCompanyDatabaseName('queryTracker', 'Thrive') => 'thrive'
 *   - getCompanyDatabaseName('employee', 'Ecosoul Home') => 'ecosoul'
 * 
 * Note: 'login' module always returns the shared login DB name
 */
export function getCompanyDatabaseName(module = 'assetTracker', company = null) {
  // Login database is shared and not company-specific
  if (module === 'login') {
    return MONGODB_CONFIG.databases.login;
  }

  // In the single-connection setup, company data lives in ONE DB per company.
  // Portals use different collections in that same DB.
  if (!company) return getDatabaseName(module);
  return normalizeCompanyDbName(company);
}

/**
 * Get database name for a specific portal/module
 * @param {string} module - Module name: 'assetTracker', 'login', 'employee', 'queryTracker'
 * @returns {string} Database name
 */
export function getDatabaseName(module = 'assetTracker') {
  return MONGODB_CONFIG.databases[module] || MONGODB_CONFIG.databases.assetTracker;
}

/**
 * Get collection name
 * @param {string} collection - Collection name: 'assets', 'users'
 * @returns {string} Collection name
 */
export function getCollectionName(collection = 'assets') {
  return MONGODB_CONFIG.collections[collection] || collection;
}

// Export default config for easy access
export default MONGODB_CONFIG;

