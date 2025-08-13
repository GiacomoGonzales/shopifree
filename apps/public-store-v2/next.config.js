/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	headers: async () => {
		return [];
	}
};

module.exports = nextConfig;


