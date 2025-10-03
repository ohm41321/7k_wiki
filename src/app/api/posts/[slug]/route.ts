import { createSupabaseReqResClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

// PUT - Update a post
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const res = NextResponse.next();
  const supabase = createSupabaseReqResClient(req, res);
  const { slug } = params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const postData = await req.json();
    const { title, content, tags, game } = postData;

    if (!title || !content) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields: title, content' }), { status: 400 });
    }

    // First, verify the user owns the post
    const { data: originalPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('slug', slug)
      .single();

    if (fetchError || !originalPost) {
      return new NextResponse(JSON.stringify({ message: 'Post not found' }), { status: 404 });
    }

    if (originalPost.author_id !== user.id) {
      return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    // User is authorized, proceed with update
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update({
        title,
        content,
        tags: (tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean),
        game,
      })
      .eq('slug', slug)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedPost, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(JSON.stringify({ message: message || 'Internal Server Error' }), { status: 500 });
  }
}

// DELETE - Delete a post
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const res = NextResponse.next();
  const supabase = createSupabaseReqResClient(req, res);
  const { slug } = params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    // Verify ownership before deleting
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('slug', slug)
      .single();

    if (fetchError || !post) {
      return new NextResponse(JSON.stringify({ message: 'Post not found' }), { status: 404 });
    }

    if (post.author_id !== user.id) {
      return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    // Proceed with deletion
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('slug', slug);

    if (deleteError) {
      throw deleteError;
    }

    return new NextResponse(null, { status: 204 }); // 204 No Content

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(JSON.stringify({ message: message || 'Internal Server Error' }), { status: 500 });
  }
}