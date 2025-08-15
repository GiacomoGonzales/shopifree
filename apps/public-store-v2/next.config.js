const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	headers: async () => {
		return [];
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

module.exports = withNextIntl(nextConfig);


