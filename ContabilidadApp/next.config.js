/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
     
    },
    output: 'standalone',
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    serverRuntimeConfig: { // available only on server
        apiURL: process.env.NEXT_PUBLIC_DOMAIN || process.env.SERVER_SIDE_DEV_API_URL,
    },
    publicRuntimeConfig: { // Will be available on both server and client
        apiURL: process.env.NEXT_PUBLIC_DOMAIN || process.env.CLIENT_SIDE_DEV_API_URL,
    },
};

module.exports = nextConfig;
