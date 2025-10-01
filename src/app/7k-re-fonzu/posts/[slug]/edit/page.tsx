import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPostBySlug } from "@/app/lib/posts";
import EditPostForm from "@/app/components/EditPostForm";

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const session = await getServerSession(authOptions);
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
        </div>
      </main>
    );
  }

  // Authorization check
  if (!session || session.user?.name?.toLowerCase() !== post.author?.toLowerCase()) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Unauthorized</h1>
          <p>You do not have permission to edit this post.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-6 text-secondary">Edit Post</h1>
      <EditPostForm post={post} />
    </main>
  );
}
