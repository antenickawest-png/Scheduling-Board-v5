/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep these settings for static export
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Keep these for development convenience
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Add this to ensure proper environment variable handling
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://msweeklyboard.com'
  }
}

// Change this to module.exports for compatibility
module.exports = nextConfig
