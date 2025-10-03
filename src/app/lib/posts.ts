import { createSupabaseServerComponentClient } from "@/lib/supabase/utils";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";

// Get all posts
export async function getPosts() {
  noStore();
  try {
    const supabase = createSupabaseServerComponentClient(cookies());

    const { data, error } = await supabase
      .from("posts")
      .select("*");

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error in getPosts:", err);
    return [];
  }
}

// Get a single post by slug
export async function getPostBySlug(slug: string) {
  noStore();
  try {
    const supabase = createSupabaseServerComponentClient(cookies());

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`Error fetching post with slug ${slug}:`, error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`Unexpected error in getPostBySlug for ${slug}:`, err);
    return null;
  }
}

// Note: createPost, updatePost, and deletePost should be handled in API routes
// to ensure they are executed in a secure, server-side environment.