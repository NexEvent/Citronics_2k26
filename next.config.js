/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // transpilePackages: ['@mui/material', '@mui/system'],

  images: {
    domains: ['localhost', 'res.cloudinary.com', 'cdgicitronics.in'],
    formats: ['image/avif', 'image/webp']
  },

  async headers() {
    return [
      {
        // PWA service worker — must be served from root
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' }
        ]
      },
      {
        // Security + offline manifest
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ]
      }
    ]
  },

  webpack(config) {
    // Allow importing SVG as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })

    return config
  }
}

module.exports = nextConfig
