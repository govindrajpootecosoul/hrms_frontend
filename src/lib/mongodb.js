import { MongoClient } from 'mongodb';
import { getMongoUri, getDatabaseName, getCompanyDatabaseName, getCollectionName, MONGODB_CONFIG } from './config/database.config';

// MongoDB connection configuration
// ⚠️ IMPORTANT: To change MongoDB connection, edit: src/lib/config/database.config.js
// This file uses the centralized configuration

const uri = getMongoUri();

let client;
let clientPromise;

// Initialize MongoDB client using centralized configuration
if (!clientPromise) {
  client = new MongoClient(uri, {
    maxPoolSize: MONGODB_CONFIG.options.maxPoolSize,
    connectTimeoutMS: MONGODB_CONFIG.options.connectTimeoutMS,
    serverSelectionTimeoutMS: MONGODB_CONFIG.options.serverSelectionTimeoutMS,
    socketTimeoutMS: MONGODB_CONFIG.options.socketTimeoutMS,
    retryWrites: MONGODB_CONFIG.options.retryWrites,
    retryReads: MONGODB_CONFIG.options.retryReads,
  });
  clientPromise = client.connect();
}

/**
 * Get company name from sessionStorage or request
 * @param {Request} request - Optional request object (for API routes)
 * @returns {string|null} Company name or null
 */
function getCompanyFromContext(request = null) {
  // Try to get from request headers first (for API routes)
  if (request && typeof request.headers?.get === 'function') {
    const company = request.headers.get('x-company');
    if (company) return company;
  }
  
  // Fallback to sessionStorage (for client-side)
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('selectedCompany');
  }
  
  return null;
}

// Helper function to get database (with optional company parameter)
export async function getDb(module = 'assetTracker', company = null) {
  const client = await clientPromise;
  const dbName = company ? getCompanyDatabaseName(module, company) : getDatabaseName(module);
  return client.db(dbName);
}

// Helper function to get assets collection (with company support)
export async function getAssetsCollection(company = null) {
  // If company not provided, try to get from context
  if (!company && typeof window !== 'undefined') {
    company = sessionStorage.getItem('selectedCompany');
  }
  
  const db = await getDb('assetTracker', company);
  const collectionName = getCollectionName('assets');
  return db.collection(collectionName);
}

// Helper function to get asset history collection (with company support)
export async function getAssetHistoryCollection(company = null) {
  // If company not provided, try to get from context
  if (!company && typeof window !== 'undefined') {
    company = sessionStorage.getItem('selectedCompany');
  }
  
  const db = await getDb('assetTracker', company);
  return db.collection('asset_history');
}

// Generic helper to get any collection (respects centralized naming config when present)
export async function getCollection(collectionKeyOrName, module = 'assetTracker', company = null) {
  // If company not provided, try to get from context
  if (!company && typeof window !== 'undefined') {
    company = sessionStorage.getItem('selectedCompany');
  }
  
  const db = await getDb(module, company);
  const collectionName = getCollectionName(collectionKeyOrName);
  return db.collection(collectionName);
}

export async function getAssetCategoriesCollection(company = null) {
  return getCollection('asset_categories', 'assetTracker', company);
}

export async function getAssetLocationsCollection(company = null) {
  return getCollection('asset_locations', 'assetTracker', company);
}

// Re-export config helpers for convenience
export { getMongoUri, getDatabaseName, getCompanyDatabaseName, getCollectionName, MONGODB_CONFIG } from './config/database.config';

export default clientPromise;

