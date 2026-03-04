/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@musekit/shared', '@musekit/database', '@musekit/design-system'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ];
  },
};

export default nextConfig;
