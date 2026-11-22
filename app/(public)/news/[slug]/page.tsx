import { notFound } from "next/navigation";
import { PostArticle } from "@/components/posts/post-article";
import { getPublishedPostBySlug } from "@/lib/data/posts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug("news", slug);
  return {
    title: post ? `${post.title} | PKRates` : "Rates News | PKRates",
    description: post?.excerpt ?? "Rates news from PKRates.",
  };
}

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug("news", slug);
  if (!post) notFound();
  return <PostArticle postType="news" post={post} />;
}
