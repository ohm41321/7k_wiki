import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Force Node.js runtime for Supabase compatibility

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
      .select('*, author:users(username)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

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
      .insert([{ post_id: post.id, user_id: user.id, content }])
      .select('*, author:users(username)')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to create comment: ${errorMessage}` }, { status: 500 });
  }
}