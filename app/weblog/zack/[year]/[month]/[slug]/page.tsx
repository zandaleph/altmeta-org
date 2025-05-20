import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Picture from "next-export-optimize-images/picture";

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), "public/weblog/zack");
  const years = fs.readdirSync(postsDirectory);
  const params = [];

  for (const year of years) {
    const yearPath = path.join(postsDirectory, year);
    if (fs.statSync(yearPath).isDirectory()) {
      const months = fs.readdirSync(yearPath);

      for (const month of months) {
        const monthPath = path.join(yearPath, month);
        if (fs.statSync(monthPath).isDirectory()) {
          const files = fs.readdirSync(monthPath);

          for (const file of files) {
            if (file.endsWith(".md")) {
              params.push({
                year,
                month,
                slug: file.replace(".md", ""),
              });
            }
          }
        }
      }
    }
  }

  return params;
}

interface PageParams {
  year: string;
  month: string;
  slug: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

async function getPostContent(params: PageParams) {
  const { year, month, slug } = params;
  const filePath = path.join(
    process.cwd(),
    "public/weblog/zack",
    year,
    month,
    `${slug}.md`
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter, content } = matter(fileContents);

  return {
    frontmatter,
    content,
  };
}

export default async function BlogPost({ params }: PageProps) {
  const settledParams = await params;
  const { year, month } = settledParams;
  const { frontmatter, content } = await getPostContent(settledParams);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{frontmatter.title}</h1>
        {frontmatter.date && (
          <time className="text-gray-600 dark:text-gray-400">
            {new Date(frontmatter.date).toLocaleDateString("en-US", {
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
            img: (props) => {
              let absSrc = props.src as string;
              if (absSrc.startsWith("./")) {
                absSrc = `/weblog/zack/${year}/${month}/${absSrc.slice(2)}`;
              }
              return (
                <Picture
                  src={absSrc}
                  alt={props.alt as string}
                  width={1200}
                  height={200}
                />
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
