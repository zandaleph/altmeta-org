import OptimizedImage from "@/components/OptimizedImage";
import { ImgHTMLAttributes } from "react";

interface BlogPictureProps extends ImgHTMLAttributes<HTMLImageElement> {
  year: string;
  month: string;
}

export default function BlogPicture({
  src,
  alt,
  year,
  month,
  ...props
}: BlogPictureProps) {
  // Convert relative markdown paths (./image.png) to absolute public paths
  // Non-relative paths (external URLs, etc.) pass through unchanged
  // OptimizedImage will handle any edge cases (Blob, undefined, etc.)
  const rootSrc = typeof src === "string" && src.startsWith("./")
    ? `/weblog/zack/${year}/${month}/${src.slice(2)}`
    : src;

  return (
    <OptimizedImage
      {...props}
      src={rootSrc}
      alt={alt}
    />
  );
}
