/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental server actions
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    },
  },
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 