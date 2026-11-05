/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
