/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable static optimization to avoid build errors
    experimental: {
        missingSuspenseWithCSRBailout: false,
        optimizePackageImports: ['recharts', 'lucide-react', 'date-fns', '@use-gesture/react', 'vaul'],
    },
}

module.exports = nextConfig
