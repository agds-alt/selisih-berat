const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // IMPORTANT: Disable offline caching (app requires internet for uploads)
  runtimeCaching: [], // Empty = no offline caching
  buildExcludes: [/middleware-manifest\.json$/],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Allow Quagga.js worker files
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
}

module.exports = withPWA(nextConfig)
