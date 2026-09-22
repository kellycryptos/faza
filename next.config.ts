import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence the workspace-root lockfile detection warning on Vercel/CI
  outputFileTracingRoot: "/home/user/app",
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    // connectkit -> @base-org/account -> @coinbase/cdp-sdk imports optional
    // @x402/* packages that aren't installed. Alias them to false so webpack
    // treats them as empty modules and the build succeeds.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402/evm/exact/client": false,
      "@x402/core/client": false,
      "@x402/svm/exact/client": false,
      "@x402/evm": false,
      // MetaMask SDK optional React Native dep
      "@react-native-async-storage/async-storage": false,
      // WalletConnect optional pretty-printer
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
