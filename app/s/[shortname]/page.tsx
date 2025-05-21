import { redirect } from "next/navigation";
import { getAllBlogPosts, getBlogPostContent } from "@/lib/blog";

interface PageParams {
  shortname: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  const shortUrls = posts
    .map((post) => {
      const content = getBlogPostContent(post);
      return content.frontmatter.shortname
        ? {
            shortname: content.frontmatter.shortname,
          }
        : null;
    })
    .filter(Boolean);

  return shortUrls;
}

export default async function ShortUrlRedirect({ params }: PageProps) {
  const { shortname } = await params;
  const posts = getAllBlogPosts();

  // Find the post with matching shortname
  const matchingPost = posts.find((post) => {
    const content = getBlogPostContent(post);
    return content.frontmatter.shortname === shortname;
  });

  if (!matchingPost) {
    // If no matching post is found, redirect to home page
    redirect("/");
  }

  // Redirect to the full URL
  redirect(
    `/weblog/zack/${matchingPost.year}/${matchingPost.month}/${matchingPost.slug}`
  );
}
