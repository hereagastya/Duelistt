import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route the app links to now exists, so dangling hrefs fail the build
  // instead of shipping as 404s.
  typedRoutes: true,
};

export default nextConfig;
