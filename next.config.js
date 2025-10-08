/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb'
    }
  },
  eslint: {
    dirs: ['app', 'lib', 'components', 'prisma', 'tests']
  }
};

module.exports = nextConfig;
