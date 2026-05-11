import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/(.*)',
        has: [{ type: 'host', value: 'www.manchestercollectionperu.com' }],
        destination: 'https://manchestercollectionperu.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;