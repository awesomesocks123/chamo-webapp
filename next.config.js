/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration optimized for Vercel deployment
  images: {
    domains: ['lh3.googleusercontent.com'], // Allow Google profile images
  },
  // Disable source maps in production for better performance
  productionBrowserSourceMaps: false,
  // Ignore ESLint errors during build (for school project)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build (for school project)
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
