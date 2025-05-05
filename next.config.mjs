/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https",
        hostname: "res.cloudinary.com", }],

  },
  compiler: {
    styledJsx: true,
  },
  productionBrowserSourceMaps: false,
  
  webpack(config) {
    config.ignoreWarnings = [
      (warning) => warning.message.includes("Failed to parse source map"),
    ];
    return config;
  },
};

export default nextConfig;

