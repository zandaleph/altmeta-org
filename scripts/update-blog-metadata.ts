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
  prev: {
    slug: string;
    year: string;
    month: string;
    title: string;
  } | null;
  next: {
    slug: string;
    year: string;
    month: string;
    title: string;
  } | null;
}

interface Metadata {
  posts: { [key: string]: PostMetadata };
}

interface StagedPost {
  slug: string;
  year: string;
  month: string;
  extension: "md" | "mdx";
  title: string;
  date: Date;
  filePath: string;
  isNew: boolean;
}

function getDeletedBlogPosts(): string[] {
  try {
    const deletedFiles = execSync("git diff --cached --name-only --diff-filter=D", {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);

    const deletedSlugs: string[] = [];

    for (const file of deletedFiles) {
      const match = file.match(/^public\/weblog\/zack\/\d{4}\/\d{2}\/([^/]+)\.mdx?$/);
      if (match) {
        deletedSlugs.push(match[1]);
      }
    }

    return deletedSlugs;
  } catch (error) {
    console.error("❌ Error getting deleted files:", error);
    process.exit(1);
  }
}

function getStagedBlogPosts(): StagedPost[] {
  try {
    const stagedFiles = execSync("git diff --cached --name-only --diff-filter=AM", {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);

    const blogPosts: StagedPost[] = [];
    const metadata = loadMetadata();

    for (const file of stagedFiles) {
      // Check if it's a blog post: public/weblog/zack/YYYY/MM/slug.md(x)
      const match = file.match(/^public\/weblog\/zack\/(\d{4})\/(\d{2})\/([^/]+\.mdx?)$/);
      if (!match) continue;

      const [, year, month, filename] = match;
      const extension = filename.endsWith(".mdx") ? "mdx" : "md";
      const slug = filename.replace(/\.mdx?$/, "");
      const filePath = path.join(process.cwd(), file);

      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data: frontmatter } = matter(fileContents);

      // Handle date - gray-matter might return it as a Date object or string
      let date: Date;
      if (frontmatter.date instanceof Date) {
        date = frontmatter.date;
      } else if (frontmatter.date) {
        date = new Date(`${frontmatter.date}T00:00:00Z`);
      } else {
        date = new Date(`${year}-${month}-01T00:00:00Z`);
      }

      blogPosts.push({
        slug,
        year,
        month,
        extension,
        title: frontmatter.title || slug,
        date,
        filePath,
        isNew: !metadata.posts[slug],
      });
    }

    return blogPosts;
  } catch (error) {
    console.error("❌ Error getting staged files:", error);
    process.exit(1);
  }
}

function loadMetadata(): Metadata {
  if (!fs.existsSync(METADATA_FILE)) {
    console.error("❌ Error: blog-metadata.json not found.");
    console.error("   Run 'npm run generate-metadata' first.");
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(METADATA_FILE, "utf8"));
}

function saveMetadata(metadata: Metadata): void {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2) + "\n");

  // Stage the updated metadata file
  try {
    execSync("git add blog-metadata.json", { stdio: "inherit" });
  } catch (error) {
    console.error("❌ Error staging metadata file:", error);
    process.exit(1);
  }
}

function getAllBlogPosts(): { slug: string; year: string; month: string; extension: "md" | "mdx"; title: string; date: Date }[] {
  const posts: { slug: string; year: string; month: string; extension: "md" | "mdx"; title: string; date: Date }[] = [];
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
          date = frontmatter.date;
        } else if (frontmatter.date) {
          date = new Date(`${frontmatter.date}T00:00:00Z`);
        } else {
          date = new Date(`${year}-${month}-01T00:00:00Z`);
        }

        posts.push({
          slug,
          year,
          month,
          extension,
          title: frontmatter.title || slug,
          date,
        });
      }
    }
  }

  return posts;
}

function fullRecompute(metadata: Metadata): Metadata {
  console.log("   Full recompute (parsing all frontmatter)...");

  const posts = getAllBlogPosts();
  posts.sort((a, b) => a.date.getTime() - b.date.getTime());

  const now = new Date().toISOString();
  const newMetadata: Metadata = { posts: {} };

  posts.forEach((post, index) => {
    const prev = index > 0 ? posts[index - 1] : null;
    const next = index < posts.length - 1 ? posts[index + 1] : null;

    // Preserve lastModified for unchanged posts, use now for changed ones
    const existingMeta = metadata.posts[post.slug];
    const lastModified = existingMeta?.lastModified || now;

    newMetadata.posts[post.slug] = {
      slug: post.slug,
      year: post.year,
      month: post.month,
      extension: post.extension,
      title: post.title,
      date: post.date.toISOString(),
      lastModified,
      prev: prev
        ? {
            slug: prev.slug,
            year: prev.year,
            month: prev.month,
            title: prev.title,
          }
        : null,
      next: next
        ? {
            slug: next.slug,
            year: next.year,
            month: next.month,
            title: next.title,
          }
        : null,
    };
  });

  return newMetadata;
}

function fastUpdate(metadata: Metadata, stagedPosts: StagedPost[]): Metadata {
  const now = new Date().toISOString();
  const newMetadata = JSON.parse(JSON.stringify(metadata)) as Metadata;

  for (const post of stagedPosts) {
    const existing = newMetadata.posts[post.slug];

    if (!existing) {
      console.error("❌ Internal error: fastUpdate called with new post");
      process.exit(1);
    }

    // Update lastModified
    existing.lastModified = now;

    // Check if title changed
    if (existing.title !== post.title) {
      existing.title = post.title;

      // Update neighbors' references
      if (existing.prev) {
        const prevPost = newMetadata.posts[existing.prev.slug];
        if (prevPost?.next) {
          prevPost.next.title = post.title;
        }
      }
      if (existing.next) {
        const nextPost = newMetadata.posts[existing.next.slug];
        if (nextPost?.prev) {
          nextPost.prev.title = post.title;
        }
      }
    }
  }

  return newMetadata;
}

function fastAppend(metadata: Metadata, newPosts: StagedPost[]): Metadata {
  console.log("   Fast append (new posts at end)...");

  const now = new Date().toISOString();
  const newMetadata = JSON.parse(JSON.stringify(metadata)) as Metadata;

  // Find current last post
  let lastPost: PostMetadata | null = null;
  for (const post of Object.values(newMetadata.posts)) {
    if (!post.next) {
      lastPost = post;
      break;
    }
  }

  // Sort new posts by date
  newPosts.sort((a, b) => a.date.getTime() - b.date.getTime());

  let prevPost = lastPost;
  for (const newPost of newPosts) {
    const postMeta: PostMetadata = {
      slug: newPost.slug,
      year: newPost.year,
      month: newPost.month,
      extension: newPost.extension,
      title: newPost.title,
      date: newPost.date.toISOString(),
      lastModified: now,
      prev: prevPost
        ? {
            slug: prevPost.slug,
            year: prevPost.year,
            month: prevPost.month,
            title: prevPost.title,
          }
        : null,
      next: null,
    };

    newMetadata.posts[newPost.slug] = postMeta;

    // Update previous post's next pointer
    if (prevPost) {
      prevPost.next = {
        slug: newPost.slug,
        year: newPost.year,
        month: newPost.month,
        title: newPost.title,
      };
    }

    prevPost = postMeta;
  }

  return newMetadata;
}

function updateMetadata(): void {
  console.log("🔍 Checking for staged blog posts...");
  const stagedPosts = getStagedBlogPosts();
  const deletedSlugs = getDeletedBlogPosts();

  if (stagedPosts.length === 0 && deletedSlugs.length === 0) {
    console.log("   No blog posts staged, skipping metadata update");
    return;
  }

  if (stagedPosts.length > 0) {
    console.log(`   Found ${stagedPosts.length} staged post(s)`);
  }
  if (deletedSlugs.length > 0) {
    console.log(`   Found ${deletedSlugs.length} deleted post(s): ${deletedSlugs.join(", ")}`);
  }

  console.log("📖 Loading existing metadata...");
  const metadata = loadMetadata();

  const newPosts = stagedPosts.filter((p) => p.isNew);
  const existingPosts = stagedPosts.filter((p) => !p.isNew);

  // Check if any dates changed on existing posts
  const dateChanged = existingPosts.some((post) => {
    const existing = metadata.posts[post.slug];
    return existing && new Date(existing.date).getTime() !== post.date.getTime();
  });

  let newMetadata: Metadata;

  if (deletedSlugs.length > 0) {
    // Deletion requires full recompute to fix prev/next chain
    console.log("🗑️  Deleted posts detected, full recompute required");
    newMetadata = fullRecompute(metadata);
    // Update lastModified for staged posts
    const now = new Date().toISOString();
    stagedPosts.forEach((post) => {
      if (newMetadata.posts[post.slug]) {
        newMetadata.posts[post.slug].lastModified = now;
      }
    });
  } else if (dateChanged) {
    // Slow path: date changed
    console.log("📅 Date changed detected");
    newMetadata = fullRecompute(metadata);
    // Update lastModified for staged posts
    const now = new Date().toISOString();
    stagedPosts.forEach((post) => {
      newMetadata.posts[post.slug].lastModified = now;
    });
  } else if (newPosts.length > 0) {
    // Check if all new posts are newer than the last post
    const sortedMetaPosts = Object.values(metadata.posts).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const lastPostDate = sortedMetaPosts.length > 0
      ? new Date(sortedMetaPosts[sortedMetaPosts.length - 1].date)
      : new Date(0);

    const allNewerThanLast = newPosts.every((p) => p.date >= lastPostDate);

    if (allNewerThanLast) {
      // Fast path: append new posts
      console.log("➕ New posts are all newer than existing posts");
      newMetadata = fastAppend(metadata, newPosts);
      // Update lastModified for any edited existing posts
      if (existingPosts.length > 0) {
        newMetadata = fastUpdate(newMetadata, existingPosts);
      }
    } else {
      // Slow path: backdated post
      console.log("⏪ Backdated post detected");
      newMetadata = fullRecompute(metadata);
      // Update lastModified for staged posts
      const now = new Date().toISOString();
      stagedPosts.forEach((post) => {
        newMetadata.posts[post.slug].lastModified = now;
      });
    }
  } else {
    // Super fast path: only existing posts, no date changes
    console.log("✏️  Content/title edits only");
    newMetadata = fastUpdate(metadata, existingPosts);
  }

  console.log("💾 Saving updated metadata...");
  saveMetadata(newMetadata);

  console.log("✅ Done!");
}

updateMetadata();
