import type { NextConfig } from "next";
import withExportImages from "next-export-optimize-images";

const nextConfig: NextConfig = {
  output: "export",
};

export default withExportImages(nextConfig);
