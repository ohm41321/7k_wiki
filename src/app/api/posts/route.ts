
import { NextResponse } from 'next/server';
import { getPosts } from '@/app/lib/posts';

export async function GET() {
  const posts = await getPosts();
  console.log('API returning posts:', posts);
  return NextResponse.json(posts);
}
