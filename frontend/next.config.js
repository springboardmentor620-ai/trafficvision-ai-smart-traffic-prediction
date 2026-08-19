/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Forwards /api/* calls from the frontend straight to the FastAPI backend
    // so the browser never needs to know the backend's real port/origin.
    return [
      {
        source: "/api/:path*",
        destination: 'http://backend:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
