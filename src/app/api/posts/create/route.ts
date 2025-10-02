import { NextResponse } from 'next/server';
import { createPost } from '@/app/lib/posts';

export async function POST(request: Request) {
  try {
    const postData = await request.json();

    // Add validation for the new 'game' field
    if (!postData.title || !postData.author || !postData.game) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields: title, author, game' }), { status: 400 });
    }

    const newPost = createPost(postData);

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(JSON.stringify({ message: message || 'Internal Server Error' }), { status: 500 });
  }
}