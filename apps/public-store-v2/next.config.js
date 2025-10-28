/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// 🚀 OPTIMIZACIÓN: Headers de cache para mejor rendimiento
	headers: async () => {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, s-maxage=3600, stale-while-revalidate=86400',
					},
				],
			},
		];
	},
	// Configuración para resolver problemas de @formatjs
	webpack: (config, { dev, isServer }) => {
		if (!dev && !isServer) {
			// Optimizaciones para evitar problemas con vendor chunks
			config.optimization.splitChunks = {
				...config.optimization.splitChunks,
				cacheGroups: {
					...config.optimization.splitChunks.cacheGroups,
					formatjs: {
						name: 'formatjs',
						test: /[\\/]node_modules[\\/]@formatjs[\\/]/,
						chunks: 'all',
						priority: 30,
					},
				},
			};
		}
		return config;
	},
};

module.exports = nextConfig;


