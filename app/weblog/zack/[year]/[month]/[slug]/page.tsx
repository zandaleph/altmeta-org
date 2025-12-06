import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllBlogPosts, getBlogPostContent } from "@/lib/blog";
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
    </article>
  );
}
