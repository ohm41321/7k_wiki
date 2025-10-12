import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const postData = await req.json();
    const { title, content, tags, category, game, imageurls } = postData;

    if (!title || !game) {
      return NextResponse.json({ message: 'Missing required fields: title, game' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);

    const newPost = {
      title,
      content: content || '',
      tags: (tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean),
      category: category || null,
      game,
      author_id: user.id, // Set author_id from the authenticated user
      author_name: user.user_metadata.full_name || user.email, // Use user metadata for name
      slug: `${slug}-${uuidv4().slice(0, 4)}`,
      imageurls: imageurls || [],
    };

    const { data, error } = await supabase.from('posts').insert(newPost).select().single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: message || 'Internal Server Error' }, { status: 500 });
  }
}
