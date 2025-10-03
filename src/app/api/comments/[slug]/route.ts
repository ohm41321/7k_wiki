import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET handler to fetch comments for a specific post slug.
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: 'Post slug is required' }, { status: 400 });
  }

  try {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to fetch comments: ${errorMessage}` }, { status: 500 });
  }
}

// POST handler to create a new comment for a specific post slug.
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: 'Post slug is required' }, { status: 400 });
  }

  try {
    const { content, author_name } = await req.json();
    if (!content || !author_name) {
      return NextResponse.json({ error: 'Content and author name are required' }, { status: 400 });
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Perform the insert but do not select the result back
    const { error } = await supabase
      .from('comments')
      .insert([{ post_id: post.id, author_name: author_name, content }]);

    if (error) throw error;

    // Return a 204 No Content response to prevent SWR from using this response as cache data
    return new NextResponse(null, { status: 204 });

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to create comment: ${errorMessage}` }, { status: 500 });
  }
}