import { createSupabaseServerComponentClient } from "@/lib/supabase/utils";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";

// Get all posts
export async function getPosts() {
  noStore();
  const supabase = createSupabaseServerComponentClient(cookies());

  const { data, error } = await supabase
    .from("posts")
    .select("*, author:users(username)");

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data;
}

// Get a single post by slug
export async function getPostBySlug(slug: string) {
  noStore();
  const supabase = createSupabaseServerComponentClient(cookies());

  const { data, error } = await supabase
    .from("posts")
    .select("*, author:users(username)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null;
  }

  return data;
}

// Note: createPost, updatePost, and deletePost should be handled in API routes
// to ensure they are executed in a secure, server-side environment.