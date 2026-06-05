import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer', '@libsql/client'],
};

export default nextConfig;
