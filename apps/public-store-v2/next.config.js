const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	headers: async () => {
		return [];
	}
};

module.exports = withNextIntl(nextConfig);


