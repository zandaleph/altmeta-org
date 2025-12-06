import { ImgHTMLAttributes } from "react";
import * as fs from "fs";
import * as path from "path";

interface ImageVariant {
  width: number;
  format: string;
  path: string;
  size: number;
}

interface ImageMetadata {
  width: number;
  height: number;
  variants: ImageVariant[];
}

interface ImageManifest {
  [key: string]: ImageMetadata;
}

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

// Load manifest once at module level (cached by Node)
let manifest: ImageManifest | null = null;

function getManifest(): ImageManifest {
  if (manifest) return manifest;

  try {
    const manifestPath = path.join(process.cwd(), "public", "optimized-images", "manifest.json");
    const manifestContent = fs.readFileSync(manifestPath, "utf-8");
    manifest = JSON.parse(manifestContent);
    return manifest as ImageManifest;
  } catch {
    // During dev or if manifest doesn't exist, return empty
    console.warn("Image manifest not found. Run 'npm run optimize-images' first.");
    return {};
  }
}

export default function OptimizedImage({ src, alt, className, ...props }: OptimizedImageProps) {
  const manifest = getManifest();
  const imageData = manifest[src];

  // If no optimized version exists, fall back to original
  if (!imageData) {
    return <img src={src} alt={alt} className={className} {...props} />;
  }

  // Group variants by format
  const variantsByFormat: { [format: string]: ImageVariant[] } = {};

  for (const variant of imageData.variants) {
    if (!variantsByFormat[variant.format]) {
      variantsByFormat[variant.format] = [];
    }
    variantsByFormat[variant.format].push(variant);
  }

  // Sort variants by width
  for (const format in variantsByFormat) {
    variantsByFormat[format].sort((a, b) => a.width - b.width);
  }

  // Prefer WebP, fall back to original format
  const webpVariants = variantsByFormat["webp"] || [];
  const originalFormat = Object.keys(variantsByFormat).find(f => f !== "webp");
  const fallbackVariants = originalFormat ? variantsByFormat[originalFormat] : [];

  // Generate srcset strings
  const webpSrcset = webpVariants.map(v => `${v.path} ${v.width}w`).join(", ");
  const fallbackSrcset = fallbackVariants.map(v => `${v.path} ${v.width}w`).join(", ");

  // Use the largest fallback variant as the src (for browsers without picture support)
  const fallbackSrc = fallbackVariants.length > 0
    ? fallbackVariants[fallbackVariants.length - 1].path
    : src;

  return (
    <picture>
      {webpSrcset && (
        <source
          type="image/webp"
          srcSet={webpSrcset}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
        />
      )}
      {fallbackSrcset && (
        <source
          srcSet={fallbackSrcset}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
        />
      )}
      <img
        src={fallbackSrc}
        alt={alt}
        width={imageData.width}
        height={imageData.height}
        className={className}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </picture>
  );
}
