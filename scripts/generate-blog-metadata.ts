#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import matter from "gray-matter";

const POSTS_DIRECTORY = path.join(process.cwd(), "public/weblog/zack");
const METADATA_FILE = path.join(process.cwd(), "blog-metadata.json");

interface PostMetadata {
  slug: string;
  year: string;
  month: string;
  extension: "md" | "mdx";
  title: string;
  date: string; // ISO 8601 UTC
  lastModified: string; // ISO 8601 UTC
  prev: string | null; // slug of previous post
  next: string | null; // slug of next post
}

interface Metadata {
  posts: { [key: string]: PostMetadata };
}

interface PostForSorting {
  slug: string;
  year: string;
  month: string;
  extension: "md" | "mdx";
  title: string;
  date: Date;
  lastModified: Date;
  filePath: string;
}

function checkShallowClone(): void {
  try {
    const result = execSync("git rev-parse --is-shallow-repository", {
      encoding: "utf8",
    }).trim();
    if (result === "true") {
      console.error("❌ Error: Cannot generate metadata from shallow clone.");
      console.error("   Run this script with full git history.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error checking git repository status");
    process.exit(1);
  }
}

function getGitLastModified(filePath: string): Date {
  try {
    const isoDate = execSync(
      `git log -1 --format=%cI -- "${filePath}"`,
      { encoding: "utf8" }
    ).trim();

    if (!isoDate) {
      throw new Error(`No git history found for ${filePath}`);
    }

    return new Date(isoDate);
  } catch (error) {
    console.error(`❌ Error getting git history for ${filePath}:`, error);
    process.exit(1);
  }
}

function getAllBlogPosts(): PostForSorting[] {
  const posts: PostForSorting[] = [];
  const years = fs.readdirSync(POSTS_DIRECTORY);

  for (const year of years) {
    const yearPath = path.join(POSTS_DIRECTORY, year);
    if (!fs.statSync(yearPath).isDirectory()) continue;

    const months = fs.readdirSync(yearPath);
    for (const month of months) {
      const monthPath = path.join(yearPath, month);
      if (!fs.statSync(monthPath).isDirectory()) continue;

      const files = fs.readdirSync(monthPath);
      for (const file of files) {
        if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

        const filePath = path.join(monthPath, file);
        const extension = file.endsWith(".mdx") ? "mdx" : "md";
        const slug = file.replace(/\.mdx?$/, "");

        const fileContents = fs.readFileSync(filePath, "utf8");
        const { data: frontmatter } = matter(fileContents);

        // Handle date - gray-matter might return it as a Date object or string
        let date: Date;
        if (frontmatter.date instanceof Date) {
          // Already a Date object, use it directly
          date = frontmatter.date;
        } else if (frontmatter.date) {
          // It's a string, parse it
          date = new Date(`${frontmatter.date}T00:00:00Z`);
        } else {
          // No date in frontmatter, use year/month
          date = new Date(`${year}-${month}-01T00:00:00Z`);
        }

        if (isNaN(date.getTime())) {
          console.error(`❌ Invalid date in ${filePath}:`);
          console.error(`   frontmatter.date: ${frontmatter.date}`);
          console.error(`   Type: ${typeof frontmatter.date}`);
          process.exit(1);
        }

        const lastModified = getGitLastModified(filePath);

        posts.push({
          slug,
          year,
          month,
          extension,
          title: frontmatter.title || slug,
          date,
          lastModified,
          filePath,
        });
      }
    }
  }

  return posts;
}

function generateMetadata(): void {
  console.log("🔍 Checking git repository...");
  checkShallowClone();

  console.log("📂 Finding all blog posts...");
  const posts = getAllBlogPosts();
  console.log(`   Found ${posts.length} posts`);

  console.log("📅 Sorting by date...");
  posts.sort((a, b) => a.date.getTime() - b.date.getTime());

  console.log("🔗 Building prev/next chain...");
  const metadata: Metadata = { posts: {} };

  posts.forEach((post, index) => {
    const prev = index > 0 ? posts[index - 1] : null;
    const next = index < posts.length - 1 ? posts[index + 1] : null;

    metadata.posts[post.slug] = {
      slug: post.slug,
      year: post.year,
      month: post.month,
      extension: post.extension,
      title: post.title,
      date: post.date.toISOString(),
      lastModified: post.lastModified.toISOString(),
      prev: prev ? prev.slug : null,
      next: next ? next.slug : null,
    };
  });

  console.log("💾 Writing metadata file...");
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2) + "\n");

  console.log("✅ Done! Generated metadata for", posts.length, "posts");
}

generateMetadata();
