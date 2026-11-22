import { notFound } from "next/navigation";
import { PostArticle } from "@/components/posts/post-article";
import { getPublishedPostBySlug } from "@/lib/data/posts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug("blog", slug);
  return {
    title: post ? `${post.title} | PKRates` : "Guides & Blog | PKRates",
    description: post?.excerpt ?? "Guides from PKRates.",
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug("blog", slug);
  if (!post) notFound();
  return <PostArticle postType="blog" post={post} />;
}
