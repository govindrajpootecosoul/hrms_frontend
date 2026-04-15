/** @type {import('next').NextConfig} */

const raw = process.env.NEXT_PUBLIC_API_URL && String(process.env.NEXT_PUBLIC_API_URL).trim();
if (!raw) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is required. Set it in .env or .env.local (e.g. http://192.168.50.107:5008/api). The app will not start without it.'
  );
}

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: raw.replace(/\/$/, ''),
  },
  /** Keep public URLs /api/hrms, /api/hrms-portal, etc.; filesystem lives under src/app/api/portals/ */
  async rewrites() {
    return [
      { source: '/api/hrms-portal/:path*', destination: '/api/portals/hrms/:path*' },
      { source: '/api/hrms', destination: '/api/portals/hrms' },
      { source: '/api/hrms/:path*', destination: '/api/portals/hrms/:path*' },
      { source: '/api/asset-tracker/:path*', destination: '/api/portals/asset-tracker/:path*' },
      { source: '/api/finance/:path*', destination: '/api/portals/finance/:path*' },
      { source: '/api/employee-portal/:path*', destination: '/api/portals/employee-portal/:path*' },
      { source: '/api/employee', destination: '/api/portals/employee' },
      { source: '/api/employee/:path*', destination: '/api/portals/employee/:path*' },
    ];
  },
};

module.exports = nextConfig;
