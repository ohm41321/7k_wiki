
import { NextResponse } from 'next/server';
import { getPosts } from '@/app/lib/posts';

export async function GET() {
  const posts = getPosts();
  return NextResponse.json(posts);
}
