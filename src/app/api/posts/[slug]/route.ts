import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// PUT - Update a post
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);
  const { slug } = params;

  console.log('PUT request received for slug:', slug);
  console.log('Full params:', params);

  // Validate and clean slug
  const cleanSlug = slug?.split(':')[0]; // Remove anything after colon
  console.log('Clean slug:', cleanSlug);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const postData = await req.json();
    const { title, content, tags, game, imageUrls } = postData;

    console.log('Received post data:', { title: title?.substring(0, 50), contentLength: content?.length, tags, game, imageUrlsCount: imageUrls?.length });

    if (!title || !content) {
      return NextResponse.json({ message: 'Missing required fields: title, content' }, { status: 400 });
    }

    const { data: originalPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('slug', cleanSlug)
      .single();

    if (fetchError || !originalPost) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (originalPost.author_id !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update({
        title,
        content,
        tags: (tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean),
        game,
        imageUrls: imageUrls || [],
      })
      .eq('slug', cleanSlug)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedPost);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete a post
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);
  const { slug } = params;

  // Validate and clean slug
  const cleanSlug = slug?.split(':')[0]; // Remove anything after colon

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('slug', cleanSlug)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (post.author_id !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('slug', cleanSlug);

    if (deleteError) {
      throw deleteError;
    }

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: message || 'Internal Server Error' }, { status: 500 });
  }
}
