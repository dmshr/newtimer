/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("@prisma/client");
    return config;
  },
};

export default nextConfig;