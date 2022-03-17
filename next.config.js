const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  images: {
    domains: ['firebasestorage.googleapis.com', 'ww2.mondialrelay.com'],
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://www.findmystuff.io" },
        ]
      }
    ]
  },
}