import { AdminTopbar } from "@/components/admin/admin-topbar";
import { PostsManager } from "@/components/admin/posts-manager";
import { getAllPosts } from "@/lib/data/posts";
import type { PostRow } from "@/types/database";

export default async function PostsAdminPage() {
  let posts: PostRow[] = [];
  let loadError = false;
  try {
    posts = await getAllPosts();
  } catch (err) {
    console.error("[posts admin page error]", err);
    loadError = true;
  }

  return (
    <>
      <AdminTopbar
        title="News & Blog"
        description="Publish rate news and evergreen guides. Only figures from a named source — never invented news."
      />
      <PostsManager posts={posts} loadError={loadError} />
    </>
  );
}
