import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getPostBySlug, updatePost } from '@/app/lib/posts';
import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'posts');

// GET a single post
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return NextResponse.json({ message: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json(post);
}

// DELETE a single post
export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const post = getPostBySlug(params.slug);
  if (!post) {
    return NextResponse.json({ message: 'Post not found' }, { status: 404 });
  }

  if (post.author !== session.user.name) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const filePath = path.join(postsDirectory, `${params.slug}.md`);
    fs.unlinkSync(filePath);
    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting post' }, { status: 500 });
  }
}

// UPDATE a single post
export async function PUT(request: Request, { params }: { params: { slug: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const post = getPostBySlug(params.slug);
    if (!post) {
        return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (post.author !== session.user.name) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { title, content, tags } = await request.json();
        if (!title || !content) {
            return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
        }

        const result = updatePost({ slug: params.slug, title, content, tags });

        if (!result.success) {
            return NextResponse.json({ message: 'Error updating post', error: result.error }, { status: 500 });
        }

        return NextResponse.json({ message: 'Post updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
}