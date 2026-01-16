/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Disable trailing slash to fix Telegram webhook 307 redirect
  trailingSlash: false,
  // Skip type checking during build for faster deploys
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
