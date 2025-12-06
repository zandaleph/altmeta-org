#!/usr/bin/env node

import * as fs from "fs/promises";
import * as path from "path";
import sharp from "sharp";
import { createHash } from "crypto";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_OUT_DIR = path.join(PUBLIC_DIR, "optimized-images");
const MANIFEST_PATH = path.join(IMAGE_OUT_DIR, "manifest.json");

// Breakpoints we want to generate (will be capped at original size)
const BREAKPOINTS = [640, 1024, 1920];

// Image formats to generate
const FORMATS = ["webp", "original"] as const;

interface ImageVariant {
  width: number;
  format: string;
  path: string;
  size: number;
}

interface ImageManifest {
  [originalPath: string]: {
    width: number;
    height: number;
    variants: ImageVariant[];
  };
}

async function* walkDirectory(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip the optimized-images directory to avoid processing our own output
    if (entry.isDirectory()) {
      if (entry.name === "optimized-images") {
        continue;
      }
      yield* walkDirectory(fullPath);
    } else if (entry.isFile() && isImageFile(entry.name)) {
      yield fullPath;
    }
  }
}

function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"].includes(ext);
}

function getOutputPath(publicPath: string, width: number, format: string): string {
  const relativePath = path.relative(PUBLIC_DIR, publicPath);
  const parsed = path.parse(relativePath);
  const hash = createHash("md5").update(publicPath).digest("hex").slice(0, 8);

  const outputFormat = format === "original"
    ? parsed.ext.slice(1)
    : format;

  const filename = `${parsed.name}_${hash}_${width}w.${outputFormat}`;
  const outputDir = path.join(IMAGE_OUT_DIR, parsed.dir);

  return path.join(outputDir, filename);
}

function getPublicUrl(outputPath: string): string {
  const relative = path.relative(PUBLIC_DIR, outputPath);
  return "/" + relative.replace(/\\/g, "/");
}

async function optimizeImage(imagePath: string, manifest: ImageManifest): Promise<void> {
  const publicUrl = "/" + path.relative(PUBLIC_DIR, imagePath).replace(/\\/g, "/");

  console.log(`Processing: ${publicUrl}`);

  const image = sharp(imagePath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    console.warn(`  Skipping: Could not read dimensions`);
    return;
  }

  // Determine which breakpoints to generate (never upscale)
  const widthsToGenerate = BREAKPOINTS.filter(w => w < metadata.width);

  // Always include original size
  widthsToGenerate.push(metadata.width);

  const variants: ImageVariant[] = [];

  for (const width of widthsToGenerate) {
    const height = Math.round((width / metadata.width) * metadata.height);

    for (const format of FORMATS) {
      const outputPath = getOutputPath(imagePath, width, format);
      const outputDir = path.dirname(outputPath);

      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      // Generate the image
      let processor = sharp(imagePath).resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      });

      if (format === "webp") {
        processor = processor.webp({ quality: 85 });
      } else {
        // Keep original format
        const originalFormat = metadata.format;
        if (originalFormat === "jpeg" || originalFormat === "jpg") {
          processor = processor.jpeg({ quality: 90 });
        } else if (originalFormat === "png") {
          processor = processor.png({ compressionLevel: 9 });
        }
      }

      await processor.toFile(outputPath);

      const stats = await fs.stat(outputPath);
      const url = getPublicUrl(outputPath);

      variants.push({
        width,
        format: format === "original" ? metadata.format || "png" : format,
        path: url,
        size: stats.size,
      });

      console.log(`  Generated: ${width}w ${format} (${(stats.size / 1024).toFixed(1)}KB)`);
    }
  }

  manifest[publicUrl] = {
    width: metadata.width,
    height: metadata.height,
    variants,
  };
}

async function main() {
  console.log("Starting image optimization...\n");

  // Ensure output directory exists
  await fs.mkdir(IMAGE_OUT_DIR, { recursive: true });

  const manifest: ImageManifest = {};
  const imageFiles: string[] = [];

  // Collect all image files
  for await (const imagePath of walkDirectory(PUBLIC_DIR)) {
    imageFiles.push(imagePath);
  }

  console.log(`Found ${imageFiles.length} images to process\n`);

  // Process each image
  for (const imagePath of imageFiles) {
    try {
      await optimizeImage(imagePath, manifest);
    } catch (error) {
      console.error(`Error processing ${imagePath}:`, error);
    }
  }

  // Write manifest
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\nOptimization complete!`);
  console.log(`Manifest written to: ${MANIFEST_PATH}`);
  console.log(`Total images processed: ${Object.keys(manifest).length}`);
}

main().catch(console.error);
