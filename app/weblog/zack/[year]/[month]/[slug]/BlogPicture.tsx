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
  // Handle non-relative paths (external images, etc)
  if (typeof src !== "string" || !src.startsWith("./")) {
    return <img {...props} src={src} alt={alt as string} />;
  }

  // Convert relative path to absolute public path
  const rootSrc = `/weblog/zack/${year}/${month}/${src.slice(2)}`;

  return (
    <OptimizedImage
      {...props}
      src={rootSrc}
      alt={alt as string}
    />
  );
}
