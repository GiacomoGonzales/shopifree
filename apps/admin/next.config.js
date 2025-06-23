/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  transpilePackages: ['@shopifree/ui', '@shopifree/types'],
};

module.exports = nextConfig; 