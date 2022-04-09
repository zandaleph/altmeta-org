/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  compiler: {
    relay: {
      src: ".",
      language: "typescript",
      artifactDirectory: "./generated/relay", // needs to match "relay" in package.json
    },
  },
  experimental: {
    concurrentFeatures: true,
  },
};
