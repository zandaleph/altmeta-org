import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CSSProperties } from "react";
import { getAllBlogPosts, getBlogPostContent } from "@/lib/blog";
import BlogPicture from "./BlogPicture";

interface HighligherStyle {
  [key: string]: CSSProperties;
}

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
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {post.date && (
          <time className="text-gray-600 dark:text-gray-400">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </header>

      <div className="prose dark:prose-invert max-w-none [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6 [&>blockquote]:text-gray-600 dark:[&>blockquote]:border-gray-700 dark:[&>blockquote]:text-gray-400">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: (props) => (
              <BlogPicture year={year} month={month} {...props} />
            ),
            code: (props) => {
              const { className, children } = props;
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus as HighligherStyle}
                  language={match[1]}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
