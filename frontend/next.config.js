/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable static optimization to avoid build errors
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
}

module.exports = nextConfig
