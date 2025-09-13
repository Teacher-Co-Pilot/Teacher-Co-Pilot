/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    },
    reactStrictMode: true,
    swcMinify: true,
}

module.exports = nextConfig