import Picture from "next-export-optimize-images/picture";
import { ImgHTMLAttributes } from "react";
import fs from "fs/promises";
import sharp from "sharp";
import path from "path";

interface BlogPictureProps extends ImgHTMLAttributes<HTMLImageElement> {
  year: string;
  month: string;
}

export default async function BlogPicture({
  src,
  alt,
  year,
  month,
  ...props
}: BlogPictureProps) {
  if (!(src instanceof String) || !src.startsWith("./")) {
    return (
      <picture>
        <img {...props} src={src} alt={alt as string} />
      </picture>
    );
  }
  const rootSrc = `/weblog/zack/${year}/${month}/${src.slice(2)}`;

  const projectRoot = process.cwd();
  const filePath = path.join(projectRoot, "public", rootSrc);

  const file = await fs.readFile(filePath);
  const image = await sharp(file).metadata();

  return (
    <Picture
      {...props}
      src={rootSrc}
      alt={alt as string}
      width={image.width}
      height={image.height}
    />
  );
}
