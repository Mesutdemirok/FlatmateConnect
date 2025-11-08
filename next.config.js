/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/oda-ilani/:id([0-9a-fA-F-]{36})",
        destination: "/oda-ilani/:slug-:id",
        permanent: true,
      },
      {
        source: "/oda-arayan/:id([0-9a-fA-F-]{36})",
        destination: "/oda-arayan/:slug-:id",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
