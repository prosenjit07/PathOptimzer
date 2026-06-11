/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle WASM modules and dynamic imports for @myriaddreamin/typst packages
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    // Handle the wasm-pack-shim import - mark it as external to prevent webpack bundling
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@myriaddreamin/typst-ts-web-compiler/pkg/wasm-pack-shim.mjs': 
          false, // Ignore this import during build
      };
    }

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },
  // Enable static export of assets
  assetPrefix: undefined,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
