import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for better serverless performance
  output: "standalone",
  // Disable image optimization for simpler deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
