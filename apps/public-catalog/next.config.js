/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'firebasestorage.googleapis.com'],
    unoptimized: true,
  },
  // Permitir subdominios en desarrollo
  async rewrites() {
    return {
      beforeFiles: [
        // En desarrollo, usar query param ?store=xxx
        // En producción, el subdominio se maneja en middleware
      ],
    };
  },
};

module.exports = nextConfig;
