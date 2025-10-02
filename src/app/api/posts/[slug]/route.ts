import { NextResponse } from 'next/server';
import { updatePost, getPostBySlug } from '@/app/lib/posts';
import fs from 'fs';
import path from 'path';

// PUT - Update a post
export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const postData = await request.json();

    if (!postData.title || !postData.content) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const result = updatePost({ slug, ...postData });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update post');
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(JSON.stringify({ message: message || 'Internal Server Error' }), { status: 500 });
  }
}

// DELETE - Delete a post
export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const post = getPostBySlug(slug);

    if (!post) {
      return new NextResponse(JSON.stringify({ message: 'Post not found' }), { status: 404 });
    }

    // Here you might want to delete associated images from Supabase as well
    // This is a future improvement, for now we just delete the markdown file.

    const postsDirectory = path.join(process.cwd(), 'posts');
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    fs.unlinkSync(fullPath);

    return new NextResponse(null, { status: 204 }); // 204 No Content

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(JSON.stringify({ message: message || 'Internal Server Error' }), { status: 500 });
  }
}
