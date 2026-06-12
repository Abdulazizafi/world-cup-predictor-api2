import type { NextConfig } from 'next';

const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3000';

const nextConfig: NextConfig = {
  // Proxy /api/proxy/* → Express backend
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
