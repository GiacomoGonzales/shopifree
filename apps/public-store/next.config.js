/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Durante el build, no fallar por warnings de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Durante el build, no fallar por errores de TypeScript
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase', '@firebase/app', '@firebase/firestore'],
    scrollRestoration: true,
  },
  transpilePackages: ['@shopifree/ui', '@shopifree/types'],
  // Enable Firebase environment variables
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  // Configure images for external sources (logos)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Configuración adicional para producción
  poweredByHeader: false,
  generateEtags: false,
  // Configuración de webpack para mejor manejo de errores
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Configuración para producción
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      }
    }
    return config
  },
};

module.exports = nextConfig; 