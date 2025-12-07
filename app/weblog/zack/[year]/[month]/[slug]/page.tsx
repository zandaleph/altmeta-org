import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { getAllBlogPosts, getBlogPostContent, getAdjacentPosts, getLastModified } from "@/lib/blog";
import BlogPicture from "./BlogPicture";
import BlogCode from "./BlogCode";
import { getMDXComponents } from "@/components/mdx/mdx-components";

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    year: post.year,
    month: post.month,
    slug: post.slug,
  }));
}

interface PageParams {
  year: string;
  month: string;
  slug: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export default async function BlogPost({ params }: PageProps) {
  const settledParams = await params;
  const { year, month, slug } = settledParams;

  // Find the blog post entry to get the extension
  const allPosts = getAllBlogPosts();
  const postEntry = allPosts.find(
    (p) => p.year === year && p.month === month && p.slug === slug
  );

  if (!postEntry) {
    throw new Error(`Blog post not found: ${year}/${month}/${slug}`);
  }

  const post = getBlogPostContent(postEntry);
  const mdxComponents = getMDXComponents(year, month, BlogPicture, BlogCode);
  const { previous, next } = getAdjacentPosts(postEntry);
  const lastModified = getLastModified(postEntry);

  // Format last modified date
  const formatDate = (date: Date): string => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const ordinal = (n: number): string => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${month} ${ordinal(day)}, ${year} ${hours}:${minutes}`;
  };

  const githubUrl = `https://github.com/zandaleph/altmeta-org/blob/main/public/weblog/zack/${year}/${month}/${slug}.${postEntry.extension}`;

  return (
    <article className="py-8">
      <header className="mb-4">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="mb-2">
          Posted{" "}
          {post.date && (
            <time>
              {post.date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
          )}{" "}
          by Zack Spellman
        </p>
        {post.frontmatter.lead && (
          <p className="italic">{post.frontmatter.lead}</p>
        )}
      </header>

      <div className="prose dark:prose-invert max-w-none [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6 [&>blockquote]:text-gray-600 dark:[&>blockquote]:border-gray-700 dark:[&>blockquote]:text-gray-400">
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
          }}
          components={mdxComponents}
        />
      </div>

      {lastModified && (
        <p className="mt-8 italic text-sm text-gray-600 dark:text-gray-400">
          <a href={githubUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">
            Last edited: {formatDate(lastModified)}
          </a>
        </p>
      )}

      <nav className="mt-8 pt-4 border-t border-gray-300 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {previous && (
            <div>
              <Link href={`/weblog/zack/${previous.year}/${previous.month}/${previous.slug}`} className="hover:underline">
                ← {previous.title}
              </Link>
            </div>
          )}
          {next && (
            <div className="text-right">
              <Link href={`/weblog/zack/${next.year}/${next.month}/${next.slug}`} className="hover:underline">
                {next.title} →
              </Link>
            </div>
          )}
        </div>
      </nav>
    </article>
  );
}
