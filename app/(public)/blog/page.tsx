import { PostList } from "@/components/posts/post-list";
import { getPublishedPosts } from "@/lib/data/posts";

export const metadata = {
  title: "Guides & Blog | PKRates",
  description: "Plain-language guides to gold rates, prize bonds, currency rates and more in Pakistan.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts("blog");
  return (
    <PostList
      postType="blog"
      title="Guides & Blog"
      intro="Plain-language guides that stay useful all year — how gold rates are set, how prize bond draws work, and what interbank and open market rates really mean."
      posts={posts}
    />
  );
}
