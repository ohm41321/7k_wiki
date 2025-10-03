import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);

  try {
    const postData = await req.json();
    // We now expect author_name instead of relying on a session
    const { title, content, tags, game, author_name } = postData;

    if (!title || !game || !author_name) {
      return NextResponse.json({ message: 'Missing required fields: title, game, author_name' }, { status: 400 });
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
      game,
      author_name: author_name, // Save the provided author name
      slug: `${slug}-${uuidv4().slice(0, 4)}`,
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
