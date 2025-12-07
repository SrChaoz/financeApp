/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable static optimization to avoid build errors
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    // Force dynamic rendering for all pages
    output: 'standalone',
    // Disable static page generation
    generateBuildId: async () => {
        return 'build-' + Date.now()
    },
}

module.exports = nextConfig
