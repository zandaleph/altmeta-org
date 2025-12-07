#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
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

interface BlogPost {
  slug: string;
  year: string;
  month: string;
  extension: "md" | "mdx";
  title: string;
  date: Date;
}

function loadMetadata(): Metadata {
  if (!fs.existsSync(METADATA_FILE)) {
    console.error("❌ Error: blog-metadata.json not found");
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(METADATA_FILE, "utf8"));
}

function getAllBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
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

function validateMetadata(): void {
  console.log("🔍 Validating blog metadata...");

  const metadata = loadMetadata();
  const posts = getAllBlogPosts();

  let errors = 0;

  // Check 1: All files exist in metadata
  console.log("   Checking all files are in metadata...");
  for (const post of posts) {
    if (!metadata.posts[post.slug]) {
      console.error(`   ❌ Post missing from metadata: ${post.slug}`);
      errors++;
    }
  }

  // Check 2: All metadata entries have corresponding files
  console.log("   Checking all metadata entries have files...");
  for (const [slug, meta] of Object.entries(metadata.posts)) {
    const post = posts.find((p) => p.slug === slug);
    if (!post) {
      console.error(`   ❌ Metadata entry has no file: ${slug}`);
      errors++;
    }
  }

  // Check 3: Dates and titles match
  console.log("   Checking dates and titles match...");
  for (const post of posts) {
    const meta = metadata.posts[post.slug];
    if (!meta) continue;

    const metaDate = new Date(meta.date);
    if (metaDate.getTime() !== post.date.getTime()) {
      console.error(`   ❌ Date mismatch for ${post.slug}:`);
      console.error(`      File: ${post.date.toISOString()}`);
      console.error(`      Meta: ${meta.date}`);
      errors++;
    }

    if (meta.title !== post.title) {
      console.error(`   ❌ Title mismatch for ${post.slug}:`);
      console.error(`      File: ${post.title}`);
      console.error(`      Meta: ${meta.title}`);
      errors++;
    }

    if (meta.year !== post.year || meta.month !== post.month) {
      console.error(`   ❌ Path mismatch for ${post.slug}:`);
      console.error(`      File: ${post.year}/${post.month}`);
      console.error(`      Meta: ${meta.year}/${meta.month}`);
      errors++;
    }

    if (meta.extension !== post.extension) {
      console.error(`   ❌ Extension mismatch for ${post.slug}:`);
      console.error(`      File: ${post.extension}`);
      console.error(`      Meta: ${meta.extension}`);
      errors++;
    }
  }

  // Check 4: Sort order is correct
  console.log("   Checking sort order...");
  const sortedPosts = posts.sort((a, b) => a.date.getTime() - b.date.getTime());
  for (let i = 0; i < sortedPosts.length; i++) {
    const post = sortedPosts[i];
    const meta = metadata.posts[post.slug];
    if (!meta) continue;

    const expectedPrev = i > 0 ? sortedPosts[i - 1] : null;
    const expectedNext = i < sortedPosts.length - 1 ? sortedPosts[i + 1] : null;

    if (expectedPrev && !meta.prev) {
      console.error(`   ❌ ${post.slug} should have prev: ${expectedPrev.slug}`);
      errors++;
    } else if (!expectedPrev && meta.prev) {
      console.error(`   ❌ ${post.slug} should not have prev (has: ${meta.prev.slug})`);
      errors++;
    } else if (expectedPrev && meta.prev && expectedPrev.slug !== meta.prev.slug) {
      console.error(`   ❌ ${post.slug} prev mismatch:`);
      console.error(`      Expected: ${expectedPrev.slug}`);
      console.error(`      Got: ${meta.prev.slug}`);
      errors++;
    }

    if (expectedNext && !meta.next) {
      console.error(`   ❌ ${post.slug} should have next: ${expectedNext.slug}`);
      errors++;
    } else if (!expectedNext && meta.next) {
      console.error(`   ❌ ${post.slug} should not have next (has: ${meta.next.slug})`);
      errors++;
    } else if (expectedNext && meta.next && expectedNext.slug !== meta.next.slug) {
      console.error(`   ❌ ${post.slug} next mismatch:`);
      console.error(`      Expected: ${expectedNext.slug}`);
      console.error(`      Got: ${meta.next.slug}`);
      errors++;
    }
  }

  // Check 5: Prev/next references are valid
  console.log("   Checking prev/next references...");
  for (const [slug, meta] of Object.entries(metadata.posts)) {
    if (meta.prev && !metadata.posts[meta.prev.slug]) {
      console.error(`   ❌ ${slug} has invalid prev reference: ${meta.prev.slug}`);
      errors++;
    }
    if (meta.next && !metadata.posts[meta.next.slug]) {
      console.error(`   ❌ ${slug} has invalid next reference: ${meta.next.slug}`);
      errors++;
    }

    // Check that referenced titles match
    if (meta.prev) {
      const prevPost = metadata.posts[meta.prev.slug];
      if (prevPost && prevPost.title !== meta.prev.title) {
        console.error(`   ❌ ${slug} prev title mismatch:`);
        console.error(`      Referenced: ${meta.prev.title}`);
        console.error(`      Actual: ${prevPost.title}`);
        errors++;
      }
    }
    if (meta.next) {
      const nextPost = metadata.posts[meta.next.slug];
      if (nextPost && nextPost.title !== meta.next.title) {
        console.error(`   ❌ ${slug} next title mismatch:`);
        console.error(`      Referenced: ${meta.next.title}`);
        console.error(`      Actual: ${nextPost.title}`);
        errors++;
      }
    }
  }

  if (errors > 0) {
    console.error(`\n❌ Validation failed with ${errors} error(s)`);
    console.error("   Run 'npm run update-metadata' to fix");
    process.exit(1);
  }

  console.log("✅ All checks passed!");
}

validateMetadata();
