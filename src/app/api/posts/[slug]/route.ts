import { NextResponse } from 'next/server';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const postsDirectory = path.join(process.cwd(), 'posts');
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return new NextResponse('Post not found', { status: 404 });
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  let imageUrls = null;
  if (data.imageUrls) {
    imageUrls = data.imageUrls.map((url: string) => {
      // Keep internal paths as-is (e.g. "/uploads/...") so Next.js Image can
      // resolve them without requiring explicit width/height at runtime.
      return url.startsWith('/') ? url : url;
    });
  }

  const postData = {
    slug,
    title: data.title,
    date: data.date,
    author: data.author,
    content,
    imageUrls: imageUrls,
  };

  return NextResponse.json(postData);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const postsDirectory = path.join(process.cwd(), 'posts');
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return NextResponse.json({ message: 'Post deleted successfully' });
    } else {
      return new NextResponse('Post not found', { status: 404 });
    }
  } catch {
    return new NextResponse('Error deleting post', { status: 500 });
  }
}
