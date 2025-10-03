import { getPostBySlug } from "@/app/lib/posts";
import EditPostForm from "@/app/components/EditPostForm";
import { createSupabaseServerComponentClient } from "@/lib/supabase/utils";
import { cookies } from "next/headers";

type PageProps = {
  params: { slug: string; game: string };
};

export default async function EditPostPage({ params }: PageProps) {
  const { slug, game } = params;
  const supabase = createSupabaseServerComponentClient(cookies());

  // Fetch post and user session in parallel
  const [post, { data: { user } }] = await Promise.all([
    getPostBySlug(slug),
    supabase.auth.getUser(),
  ]);

  if (!post) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
        </div>
      </main>
    );
  }

  // Authorization check: user must be logged in and be the author of the post
  if (!user || user.id !== post.author_id) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Unauthorized</h1>
          <p>You do not have permission to edit this post.</p>
        </div>
      </main>
    );
  }

  // The post object from getPostBySlug is already in the correct format for the form
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-6 text-secondary">Edit Post</h1>
      <EditPostForm post={post} game={game} />
    </main>
  );
}