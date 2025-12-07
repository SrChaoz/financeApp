/** @type {import('next').NextConfig} */
const nextConfig = {
    // Force dynamic rendering to avoid static generation issues
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    // Disable static optimization for problematic pages
    output: 'standalone',
}

module.exports = nextConfig
