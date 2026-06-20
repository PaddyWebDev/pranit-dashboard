import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.magnific.com',
        pathname: '/**', // Crucial: matches any path/sub-folder after the domain
      },
    ],
  },
};

export default nextConfig;