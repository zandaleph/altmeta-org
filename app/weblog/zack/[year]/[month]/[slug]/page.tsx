import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllBlogPosts, getBlogPostContent } from "@/lib/blog";
import BlogPicture from "./BlogPicture";
import BlogCode from "./BlogCode";

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
  const { year, month } = settledParams;
  const post = getBlogPostContent(settledParams);

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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: (props) => (
              <BlogPicture year={year} month={month} {...props} />
            ),
            code: (props) => <BlogCode {...props} />,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
