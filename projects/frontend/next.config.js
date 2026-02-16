// Import network config (single source of truth for network settings)
const { getApiUrl } = require('./config/network.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Use API URL from .env.local file (must be set)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || getApiUrl(),
  },
}

module.exports = nextConfig

