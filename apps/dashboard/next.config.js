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
    serverComponentsExternalPackages: ['firebase', 'firebase-admin', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
  transpilePackages: ['@shopifree/ui', '@shopifree/types'],
  // Dashboard is completely CSR - no SSR needed for pages
  // Configure images for external sources (Cloudinary, etc.)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix for Firebase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
  // Ensure environment variables are available during build
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
};

module.exports = nextConfig; 