import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@pressroom/shared'],
  serverExternalPackages: ['puppeteer'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark react-dom/server as external for server builds
      config.externals = [...(config.externals || []), 'react-dom/server'];
    }
    return config;
  },
};

export default nextConfig;
