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
