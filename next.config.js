/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['www.1177.se'],
  },
  async rewrites() {
    return [
      // API rewrites for better organization
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig