const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  transpilePackages: ['@shopifree/ui', '@shopifree/types'],
  reactStrictMode: true,
};

module.exports = withNextIntl(nextConfig); 