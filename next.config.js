/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental server actions
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.netlify.app",
        "*.bolt.new",
        "*.stackblitz.com"
      ]
    },
  },
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable standalone output for better deployment compatibility
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['via.placeholder.com', 'images.unsplash.com']
  },
  // Environment variables
  env: {
    CUSTOM_KEY: 'value',
  },
  // Webpack configuration for deployment
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 