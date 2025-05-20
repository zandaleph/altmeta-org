import Picture from "next-export-optimize-images/picture";
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
}: BlogPictureProps) {
  let absSrc = src as string;
  if (absSrc.startsWith("./")) {
    absSrc = `/weblog/zack/${year}/${month}/${absSrc.slice(2)}`;
  }

  return <Picture src={absSrc} alt={alt as string} width={1200} height={200} />;
}
