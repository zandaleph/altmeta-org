import Link from "next/link";
import { getAllBlogPosts, getBlogPostContent } from "@/lib/blog";

export default async function Home() {
  const postEntries = getAllBlogPosts();
  const posts = postEntries.map((entry) => getBlogPostContent(entry));
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-serif">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
        <section className="w-full">
          <h2 className="text-2xl font-bold mb-6 font-sans">Blog Posts</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-b border-gray-200 dark:border-gray-800 pb-4"
              >
                <h3 className="text-xl font-semibold mb-2 font-sans">
                  <Link
                    href={`/weblog/zack/${post.year}/${post.month}/${post.slug}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </h3>
                <time className="text-sm text-gray-600 dark:text-gray-400">
                  {post.date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
