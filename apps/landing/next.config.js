const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  transpilePackages: ['@shopifree/ui', '@shopifree/types'],
  output: undefined,
  trailingSlash: false,
  generateBuildId: async () => {
    return 'shopifree-dynamic-build'
  },
  reactStrictMode: true,
  exportPathMap: undefined,
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
};

module.exports = withNextIntl(nextConfig); 