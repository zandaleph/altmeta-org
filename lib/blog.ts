import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPostEntry {
  year: string;
  month: string;
  slug: string;
  extension: "md" | "mdx";
}

export interface BlogPostContent extends BlogPostEntry {
  title: string;
  date: Date;
  content: string;
  frontmatter: { [key: string]: string };
}

const POSTS_DIRECTORY = path.join(process.cwd(), "public/weblog/zack");

export function getAllBlogPosts(): BlogPostEntry[] {
  const years = fs.readdirSync(POSTS_DIRECTORY);
  const posts: BlogPostEntry[] = [];

  for (const year of years) {
    const yearPath = path.join(POSTS_DIRECTORY, year);
    if (fs.statSync(yearPath).isDirectory()) {
      const months = fs.readdirSync(yearPath);

      for (const month of months) {
        const monthPath = path.join(yearPath, month);
        if (fs.statSync(monthPath).isDirectory()) {
          const files = fs.readdirSync(monthPath);

          for (const file of files) {
            if (file.endsWith(".md") || file.endsWith(".mdx")) {
              const extension = file.endsWith(".mdx") ? "mdx" : "md";
              posts.push({
                slug: file.replace(/\.mdx?$/, ""),
                year,
                month,
                extension,
              });
            }
          }
        }
      }
    }
  }
  return posts;
}

export function getBlogPostContent(entry: BlogPostEntry): BlogPostContent {
  const { year, month, slug, extension } = entry;
  const filePath = path.join(POSTS_DIRECTORY, year, month, `${slug}.${extension}`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter, content } = matter(fileContents);

  return {
    title: frontmatter.title || slug,
    date: new Date(
      frontmatter.date
        ? `${frontmatter.date}T00:00:00Z`
        : `${year}-${month}-01T00:00:00Z`
    ),
    slug,
    year,
    month,
    extension,
    content,
    frontmatter,
  };
}

export interface AdjacentPost {
  slug: string;
  year: string;
  month: string;
  title: string;
}

export interface AdjacentPosts {
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
}

interface BlogMetadata {
  posts: {
    [slug: string]: {
      slug: string;
      year: string;
      month: string;
      extension: "md" | "mdx";
      title: string;
      date: string;
      lastModified: string;
      prev: string | null; // slug of previous post
      next: string | null; // slug of next post
    };
  };
}

let metadataCache: BlogMetadata | null = null;

function loadMetadata(): BlogMetadata {
  if (metadataCache === null) {
    const metadataPath = path.join(process.cwd(), "blog-metadata.json");
    const metadataContent = fs.readFileSync(metadataPath, "utf8");
    metadataCache = JSON.parse(metadataContent);
  }
  return metadataCache!;
}

export function getAdjacentPosts(entry: BlogPostEntry): AdjacentPosts {
  const metadata = loadMetadata();
  const postMeta = metadata.posts[entry.slug];

  if (!postMeta) {
    return { previous: null, next: null };
  }

  // Look up the full post data for prev/next
  const previous = postMeta.prev
    ? {
        slug: metadata.posts[postMeta.prev].slug,
        year: metadata.posts[postMeta.prev].year,
        month: metadata.posts[postMeta.prev].month,
        title: metadata.posts[postMeta.prev].title,
      }
    : null;

  const next = postMeta.next
    ? {
        slug: metadata.posts[postMeta.next].slug,
        year: metadata.posts[postMeta.next].year,
        month: metadata.posts[postMeta.next].month,
        title: metadata.posts[postMeta.next].title,
      }
    : null;

  return {
    previous,
    next,
  };
}

export function getLastModified(entry: BlogPostEntry): Date | null {
  const metadata = loadMetadata();
  const postMeta = metadata.posts[entry.slug];

  if (!postMeta?.lastModified) {
    return null;
  }

  return new Date(postMeta.lastModified);
}
