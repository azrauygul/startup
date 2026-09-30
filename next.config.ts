import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root,
  },
  // Browser checks often use 127.0.0.1 while `next dev` allows localhost only.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
