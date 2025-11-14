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

module.exports = nextConfig
