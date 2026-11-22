import { PostList } from "@/components/posts/post-list";
import { getPublishedPosts } from "@/lib/data/posts";

export const metadata = {
  title: "Rates News | PKRates",
  description: "Short, sourced updates on gold, dollar, petrol and prize bond rates in Pakistan.",
};

export default async function NewsPage() {
  const posts = await getPublishedPosts("news");
  return (
    <PostList
      postType="news"
      title="Rates News"
      intro="Short updates whenever a rate moves — gold board, dollar, OGRA fuel prices and prize bond draws. Every figure comes from a named source; nothing is guessed."
      posts={posts}
    />
  );
}
